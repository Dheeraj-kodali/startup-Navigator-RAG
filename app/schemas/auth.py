"""
Auth schemas — registration, login, token responses, password reset.
"""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


# ── Registration ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters")
    name: str = Field(..., min_length=1, max_length=255)


class RegisterResponse(BaseModel):
    message: str = "Account created successfully. Please verify your email."
    email: str


# ── Login ────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


# ── Token Refresh ────────────────────────────────────────────
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Password Reset ───────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Generic Auth Messages ────────────────────────────────────
class AuthMessageResponse(BaseModel):
    message: str
