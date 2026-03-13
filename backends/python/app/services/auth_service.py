from passlib.context import CryptContext
from app.models import User
from app.repositories.factory import get_user_repository
from app.auth.jwt import create_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def register(email: str, password: str) -> str:
    repo = get_user_repository()
    existing = await repo.find_by_email(email)
    if existing:
        raise ValueError("email already registered")
    hashed = pwd_context.hash(password)
    user = User(email=email, password_hash=hashed)
    user = await repo.save(user)
    return create_token(user.id, user.email)


async def login(email: str, password: str) -> str:
    repo = get_user_repository()
    user = await repo.find_by_email(email)
    if not user or not pwd_context.verify(password, user.password_hash):
        raise ValueError("invalid email or password")
    return create_token(user.id, user.email)
