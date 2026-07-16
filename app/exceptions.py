"""
Structured exception hierarchy for the application.

Every exception maps to a specific HTTP status code and machine-readable
error code. The global exception handler in main.py converts these into
RFC 7807-style JSON responses.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class AppException(Exception):
    """Base exception — all custom exceptions inherit from this."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: Optional[str] = None,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message or self.__class__.message
        self.error_code = error_code or self.__class__.error_code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        payload = {
            "error": True,
            "error_code": self.error_code,
            "message": self.message,
        }
        if self.details:
            payload["details"] = self.details
        return payload


# ── 400 Bad Request ──────────────────────────────────────────
class BadRequestException(AppException):
    status_code = 400
    error_code = "BAD_REQUEST"
    message = "The request was invalid."


class ValidationException(AppException):
    status_code = 422
    error_code = "VALIDATION_ERROR"
    message = "Request validation failed."


# ── 401 Unauthorized ─────────────────────────────────────────
class UnauthorizedException(AppException):
    status_code = 401
    error_code = "UNAUTHORIZED"
    message = "Authentication is required."


class InvalidCredentialsException(AppException):
    status_code = 401
    error_code = "INVALID_CREDENTIALS"
    message = "Invalid email or password."


class TokenExpiredException(AppException):
    status_code = 401
    error_code = "TOKEN_EXPIRED"
    message = "Authentication token has expired."


class InvalidTokenException(AppException):
    status_code = 401
    error_code = "INVALID_TOKEN"
    message = "Authentication token is invalid."


# ── 403 Forbidden ────────────────────────────────────────────
class ForbiddenException(AppException):
    status_code = 403
    error_code = "FORBIDDEN"
    message = "You do not have permission to perform this action."


class InactiveUserException(AppException):
    status_code = 403
    error_code = "INACTIVE_USER"
    message = "This account has been deactivated."


# ── 404 Not Found ────────────────────────────────────────────
class NotFoundException(AppException):
    status_code = 404
    error_code = "NOT_FOUND"
    message = "The requested resource was not found."


class UserNotFoundException(NotFoundException):
    error_code = "USER_NOT_FOUND"
    message = "User not found."


class ArticleNotFoundException(NotFoundException):
    error_code = "ARTICLE_NOT_FOUND"
    message = "Article not found."


class CategoryNotFoundException(NotFoundException):
    error_code = "CATEGORY_NOT_FOUND"
    message = "Category not found."


class ResourceNotFoundException(NotFoundException):
    error_code = "RESOURCE_NOT_FOUND"
    message = "Resource not found."


# ── 409 Conflict ─────────────────────────────────────────────
class ConflictException(AppException):
    status_code = 409
    error_code = "CONFLICT"
    message = "A resource with this identifier already exists."


class EmailAlreadyExistsException(ConflictException):
    error_code = "EMAIL_EXISTS"
    message = "An account with this email already exists."


class SlugAlreadyExistsException(ConflictException):
    error_code = "SLUG_EXISTS"
    message = "An item with this slug already exists."


# ── 429 Rate Limited ─────────────────────────────────────────
class RateLimitException(AppException):
    status_code = 429
    error_code = "RATE_LIMITED"
    message = "Too many requests. Please try again later."
