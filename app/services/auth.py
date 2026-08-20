import jwt
from fastapi import Depends, HTTPException

from ..core.security import create_access_token, create_refresh_token, decode_token, verify_password
from ..repositories.tokens import RefreshTokenRepository, get_token_repo
from ..repositories.users import UserRepository, get_user_repo
from ..schemas.models import AccessTokenResponse, TokenResponse, User


class AuthService:
    def __init__(self, users: UserRepository, tokens: RefreshTokenRepository):
        self.users = users
        self.tokens = tokens

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.users.get_by_email(email)
        if not user or not user.password_hash or not verify_password(password, user.password_hash):
            raise HTTPException(401, "Invalid email or password")
        if not user.active:
            raise HTTPException(403, "Account disabled")
        access = create_access_token(user.id, user.roles)
        refresh = create_refresh_token(user.id, user.roles)
        await self.tokens.add(decode_token(refresh)["jti"], user.id)
        return TokenResponse(access_token=access, refresh_token=refresh, roles=user.roles,
                             user=User.model_validate(user, from_attributes=True))

    async def refresh(self, refresh_token: str) -> AccessTokenResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("not a refresh token")
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Refresh token expired")
        except Exception:
            raise HTTPException(401, "Invalid refresh token")
        if not await self.tokens.exists(payload["jti"]):
            raise HTTPException(401, "Refresh token revoked")
        return AccessTokenResponse(
            access_token=create_access_token(int(payload["sub"]), payload.get("roles", [])))

    async def logout(self, refresh_token: str) -> None:
        try:
            await self.tokens.remove(decode_token(refresh_token)["jti"])
        except Exception:
            pass

    async def me(self, user_id: int) -> User:
        user = await self.users.get(user_id)
        if not user:
            raise HTTPException(404, "User not found")
        return User.model_validate(user, from_attributes=True)


def get_auth_service(users: UserRepository = Depends(get_user_repo),
                     tokens: RefreshTokenRepository = Depends(get_token_repo)) -> AuthService:
    return AuthService(users, tokens)
