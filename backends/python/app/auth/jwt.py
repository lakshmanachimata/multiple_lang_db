from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import JWT_SECRET, JWT_EXPIRATION_SECONDS

ALGORITHM = "HS256"


def create_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION_SECONDS)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None
