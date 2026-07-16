"""
Startup Navigator — FastAPI Application Entry Point

Production-ready FastAPI application with:
- JWT Authentication
- Role-based access control (User / Admin / Super Admin)
- Async PostgreSQL (Neon) via SQLAlchemy
- Structured logging
- Rate limiting
- CORS
- Global exception handling
- Health check endpoint
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi.exceptions import RequestValidationError

from app.api.v1.router import api_router
from app.config import get_settings
from app.database import engine
from app.exceptions import AppException
from app.logging_config import get_logger, setup_logging
from app.middleware.logging_middleware import RequestLoggingMiddleware

settings = get_settings()
logger = get_logger(__name__)


# ── Lifespan ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    setup_logging()
    logger.info(
        "application_starting",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        env=settings.APP_ENV,
    )
    yield
    # Shutdown: dispose of the async engine connection pool
    await engine.dispose()
    logger.info("application_shutdown")


# ── App Factory ───────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="API for Startup Navigator — helping entrepreneurs navigate every stage of building a startup.",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── Rate Limiting ─────────────────────────────────────
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── CORS ──────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Response-Time"],
    )

    # ── Request Logging ───────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    # ── Global Exception Handler ──────────────────────────
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(
            "app_exception",
            error_code=exc.error_code,
            message=exc.message,
            path=request.url.path,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            "unhandled_exception",
            error=str(exc),
            error_type=type(exc).__name__,
            path=request.url.path,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "error_code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred." if settings.is_production else str(exc),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(
            "request_validation_error",
            errors=exc.errors(),
            body=str(exc.body),
            path=request.url.path,
        )
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "body": str(exc.body)},
        )

    # ── Routes ────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["System"])
    async def health_check():
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    @app.get("/api", tags=["System"])
    @app.get("/api/v1", tags=["System"])
    @app.get("/api/v1/health", tags=["System"])
    async def api_health_check():
        return await health_check()

    @app.get("/debug-path")
    async def debug_path():
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        frontend_dir = os.path.join(base_dir, "frontend")
        out_dir = os.path.join(frontend_dir, "out")
        
        return {
            "cwd": os.getcwd(),
            "file": __file__,
            "abspath": os.path.abspath(__file__),
            "base_dir": base_dir,
            "frontend_exists": os.path.exists(frontend_dir),
            "out_exists": os.path.exists(out_dir),
            "out_is_dir": os.path.isdir(out_dir),
            "base_contents": os.listdir(base_dir) if os.path.exists(base_dir) else [],
            "frontend_contents": os.listdir(frontend_dir) if os.path.exists(frontend_dir) else [],
            "out_contents": os.listdir(out_dir) if os.path.exists(out_dir) else [],
        }

    # ── Frontend Static Files & SPA Routing ──────────────────
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_out_dir = os.path.join(base_dir, "frontend", "out")
        
    if os.path.isdir(frontend_out_dir):
        # Mount Next.js internal static assets
        _next_dir = os.path.join(frontend_out_dir, "_next")
        if os.path.isdir(_next_dir):
            app.mount("/_next", StaticFiles(directory=_next_dir), name="next-assets")

        @app.get("/")
        async def serve_root():
            index_path = os.path.join(frontend_out_dir, "index.html")
            if os.path.isfile(index_path):
                return FileResponse(index_path)
            return JSONResponse(status_code=404, content={"detail": "Not Found"})

        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            clean_path = full_path.lstrip("/")
            
            if clean_path.startswith("api/"):
                return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
            # Try exact file match (e.g. /favicon.ico)
            exact_path = os.path.join(frontend_out_dir, clean_path)
            if os.path.isfile(exact_path):
                return FileResponse(exact_path)
            
            # Try Next.js generated HTML route (e.g. /knowledge -> /knowledge.html)
            html_path = os.path.join(frontend_out_dir, clean_path + ".html")
            if os.path.isfile(html_path):
                return FileResponse(html_path)
                
            # Try trailingSlash Next.js export (e.g. /knowledge -> /knowledge/index.html)
            dir_index_path = os.path.join(frontend_out_dir, clean_path, "index.html")
            if os.path.isfile(dir_index_path):
                return FileResponse(dir_index_path)
            
            # Fallback to generic index for client-side routing, or return 404
            fallback_path = os.path.join(frontend_out_dir, "404.html")
            if os.path.isfile(fallback_path):
                return FileResponse(fallback_path, status_code=404)
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
    else:
        logger.warning(f"Frontend static directory not found: {frontend_out_dir}")

    return app


# ── Application Instance ─────────────────────────────────────
app = create_app()


# ── CLI Entry Point ───────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=not settings.is_production,
        log_level=settings.LOG_LEVEL.lower(),
    )
