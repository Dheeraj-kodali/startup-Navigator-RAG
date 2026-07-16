# 🚀 Startup Navigator — Full Stack Portal

Startup Navigator is a production-ready, responsive corporate navigator portal helping entrepreneurs structure, register, and scale their startups.

---

## 🏗️ Architecture & Component Design

The platform uses a clean separation of concerns. You can view the interactive visual [Architecture diagram here](/architecture) when running the application locally or in production.

```
┌────────────────────────────────┐
│      Next.js 15 Frontend       │  <-- Deployed on Vercel
│  (Tailwind v4, TS, Lucide, E2E)│
└──────────────┬─────────────────┘
               │ (JSON APIs over HTTPS)
               ▼
┌────────────────────────────────┐
│      FastAPI Python Backend    │  <-- Deployed on Render
│ (Async SQLAlchemy, Auth, RAG)  │
└──────────────┬─────────────────┘
               ├──────────────────────┐
               ▼                      ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│     Neon PostgreSQL       │  │      Gemini LLM (RAG)     │
│ (Alembic manual schema,  │  │(LangChain context prompt, │
│  optimized indexes)       │  │ vector indexings)         │
└───────────────────────────┘  └───────────────────────────┘
```

---

## 🤖 AI Tools & Prompts Used

This codebase was developed collaboratively with:
*   **Google Gemini 3.5 Flash** — Scaffolding backend services, creating db-agnostic migrations, compiling Next.js app page router directories, writing Playwright viewports, and optimizing SQLite tests.

### Key Prompts Used:
1.  *"Generate database models. Users, Articles, Resources, SearchHistory, Admin, DashboardStats. Use SQLAlchemy. Generate migrations..."*
2.  *"Generate authentication. Signup, Login, JWT, Password Hashing, Role Based Access, Forgot Password API..."*
3.  *"Generate all CRUD APIs. Articles, Resources, Dashboard, Search History, Pagination, Filtering, Sorting..."*
4.  *"Build AI Search. Use Gemini API, LangChain, ChromaDB. Implement Retrieval Augmented Generation..."*
5.  *"Generate frontend using Next.js, TypeScript, Tailwind, shadcn/ui. Home, Explore, AI Search, Resources..."*

---

## 🔧 Environment Variables Config

### 1. Backend Service (Render / local `.env`)
*   `DATABASE_URL`: Connection URL string for Neon PostgreSQL database.
*   `JWT_SECRET_KEY`: Minimum 32-character random string for signing JWT tokens.
*   `GROQ_API_KEY`: API credential key from Groq Console.
*   `APP_ENV`: `production` or `development`.
*   `DEBUG`: Set `false` in production.
*   `CORS_ORIGINS`: JSON array of allowed URLs e.g. `["https://your-vercel-domain.vercel.app"]`.

### 2. Frontend Service (Vercel)
*   `NEXT_PUBLIC_API_URL`: Base backend endpoint URL, e.g. `https://startup-navigator-backend.onrender.com/api/v1`.

---

## 🚀 Deployment Steps

### Step 1: Database Setup (Neon)
1.  Register at [Neon.tech](https://neon.tech) and spin up a Serverless PostgreSQL database.
2.  Copy the connection string (with `sslmode=require`).
3.  Execute migrations locally targeting Neon:
    ```bash
    $env:DATABASE_URL="your-neon-url"
    alembic upgrade head
    python app/seed.py
    ```

### Step 2: Backend Deployment (Render)
1.  Connect your GitHub repository to [Render](https://render.com).
2.  Create a new **Web Service**, select Python environment.
3.  Set build command: `pip install -r requirements.txt`.
4.  Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5.  Populate Environment Variables (`DATABASE_URL`, `JWT_SECRET_KEY`, `GROQ_API_KEY`, `CORS_ORIGINS`).

### Step 3: Frontend Deployment (Vercel)
1.  Connect your repository to [Vercel](https://vercel.com).
2.  Set Root Directory as `frontend`.
3.  Add `NEXT_PUBLIC_API_URL` environment variable targeting the Render live URL.
4.  Deploy.

---

## 🧪 Testing Checklist

Before going live, execute these automated tasks to verify integrity:
*   [ ] **Pytest Suite:** Run `pytest -o asyncio_mode=auto` (Ensures all 16 auth and CRUD cases pass).
*   [ ] **Next.js Build:** Run `npm run build` inside `./frontend` (Verifies no TypeScript compiling warnings).
*   [ ] **Playwright E2E:** Spin up local instances and run `npx playwright test` (Verifies form toggling and responsiveness).

---

## 📋 Production Readiness Checklist

- [x] CORS allowed origins configured safely.
- [x] Structured logs format turned to JSON.
- [x] Rate limiting configured on heavy API endpoints (Auth, Search).
- [x] DB connection pooling parameters bypassed for local SQLite tests, enabled for Neon PostgreSQL.
- [x] Suspense boundaries wrapped around router query states to prevent server-side rendering bailout errors.
- [x] Database fallback queries implemented in case Gemini API limits are hit.
