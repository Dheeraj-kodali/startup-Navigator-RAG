"""
Auth API endpoints — register, login, refresh, password management.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthMessageResponse,
    LoginRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.common import ApiResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse[RegisterResponse], status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    service = AuthService(db)
    user = await service.register(email=body.email, password=body.password, name=body.name)
    return ApiResponse(
        message="Account created successfully.",
        data=RegisterResponse(email=user.email),
    )


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and receive JWT tokens."""
    service = AuthService(db)
    tokens = await service.login(email=body.email, password=body.password)
    return ApiResponse(data=TokenResponse(**tokens))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a refresh token for a new token pair."""
    service = AuthService(db)
    tokens = await service.refresh_tokens(body.refresh_token)
    return ApiResponse(data=TokenResponse(**tokens))


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return ApiResponse(data=UserResponse.model_validate(current_user))


@router.post("/change-password", response_model=ApiResponse[AuthMessageResponse])
async def change_password(
    body: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the authenticated user's password."""
    service = AuthService(db)
    await service.change_password(
        user_id=current_user.id,
        current_password=body.current_password,
        new_password=body.new_password,
    )
    return ApiResponse(data=AuthMessageResponse(message="Password changed successfully."))


@router.post("/forgot-password", response_model=ApiResponse[AuthMessageResponse])
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate a password reset token and return it (normally sent via email)."""
    service = AuthService(db)
    token = await service.forgot_password(body.email)
    # We return the token for testing/dev ease in the API response wrapper
    return ApiResponse(
        message="If the email exists, a password reset link has been generated.",
        data=AuthMessageResponse(message=token)
    )


@router.post("/reset-password", response_model=ApiResponse[AuthMessageResponse])
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset user password using a valid reset token."""
    service = AuthService(db)
    await service.reset_password(token=body.token, new_password=body.new_password)
    return ApiResponse(data=AuthMessageResponse(message="Password has been reset successfully."))

