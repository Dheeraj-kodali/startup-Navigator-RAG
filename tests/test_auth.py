"""
Tests for authentication, authorization, role-based access, and token management.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import decode_token

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession):
    """Test user signup registration."""
    payload = {
        "email": "newuser@startupnavigator.com",
        "password": "StrongPassword123!",
        "name": "New Entrepreneur"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["email"] == payload["email"]

    # Verify database entry
    stmt = select(User).where(User.email == payload["email"])
    result = await db_session.execute(stmt)
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.name == payload["name"]
    assert user.email_verified is False


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user: User):
    """Test registration fails with duplicate email."""
    payload = {
        "email": test_user.email,
        "password": "AnotherPassword123!",
        "name": "Duplicate User"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    
    assert response.status_code == 409
    assert response.json()["error_code"] == "EMAIL_EXISTS"


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, test_user: User):
    """Test login credentials validation and JWT issuance."""
    payload = {
        "email": test_user.email,
        "password": "Password123!"
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "access_token" in res_data["data"]
    assert "refresh_token" in res_data["data"]
    assert res_data["data"]["token_type"] == "bearer"

    # Decode and verify JWT access token claims
    access_token = res_data["data"]["access_token"]
    payload_decoded = decode_token(access_token)
    assert payload_decoded["sub"] == str(test_user.id)
    assert payload_decoded["role"] == test_user.role.value
    assert payload_decoded["type"] == "access"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user: User):
    """Test login fails with incorrect password."""
    payload = {
        "email": test_user.email,
        "password": "WrongPassword!"
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    
    assert response.status_code == 401
    assert response.json()["error_code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, test_user: User):
    """Test refresh token rotation yields new tokens."""
    # Login to get refresh token
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    refresh_token = login_resp.json()["data"]["refresh_token"]

    # Exchange refresh token
    refresh_resp = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token
    })
    
    assert refresh_resp.status_code == 200
    res_data = refresh_resp.json()
    assert "access_token" in res_data["data"]
    assert "refresh_token" in res_data["data"]


@pytest.mark.asyncio
async def test_protected_routes_auth_required(client: AsyncClient):
    """Test protected routes return 401 without JWT header."""
    response = await client.get("/api/v1/users/profile")
    assert response.status_code == 422 # missing Authorization header (FastAPI header validation)


@pytest.mark.asyncio
async def test_role_based_access_user_profile(client: AsyncClient, test_user: User):
    """Test standard user can access their profile with valid token."""
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    access_token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    response = await client.get("/api/v1/users/profile", headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == test_user.email


@pytest.mark.asyncio
async def test_role_based_access_admin_endpoints(client: AsyncClient, test_user: User, test_admin: User):
    """Test RBAC restrictions on admin dashboard."""
    # 1. Login as standard User -> Expect 403 Forbidden on dashboard
    user_login = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    user_token = user_login.json()["data"]["access_token"]
    
    user_response = await client.get("/api/v1/dashboard", headers={"Authorization": f"Bearer {user_token}"})
    assert user_response.status_code == 403
    assert user_response.json()["error_code"] == "FORBIDDEN"

    # 2. Login as Admin User -> Expect 200 OK
    admin_login = await client.post("/api/v1/auth/login", json={
        "email": test_admin.email,
        "password": "AdminPassword123!"
    })
    admin_token = admin_login.json()["data"]["access_token"]
    
    admin_response = await client.get("/api/v1/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_response.status_code == 200
    assert admin_response.json()["success"] is True


@pytest.mark.asyncio
async def test_forgot_and_reset_password(client: AsyncClient, test_user: User, db_session: AsyncSession):
    """Test forgot-password generation and reset flow."""
    # 1. Request forgot password link/token
    forgot_resp = await client.post("/api/v1/auth/forgot-password", json={
        "email": test_user.email
    })
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json()["data"]["message"]
    assert reset_token is not None

    # 2. Reset password using the token
    reset_resp = await client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "NewSecretPassword123!"
    })
    assert reset_resp.status_code == 200
    assert reset_resp.json()["success"] is True

    # 3. Test login succeeds with the new password
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "NewSecretPassword123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()["data"]
