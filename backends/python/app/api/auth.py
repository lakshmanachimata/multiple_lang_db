from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.auth_service import register as do_register, login as do_login

router = APIRouter()


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str


@router.post("/register", response_model=AuthResponse)
async def register(req: AuthRequest):
    try:
        token = await do_register(req.email, req.password)
        return AuthResponse(token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    try:
        token = await do_login(req.email, req.password)
        return AuthResponse(token=token)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid email or password")
