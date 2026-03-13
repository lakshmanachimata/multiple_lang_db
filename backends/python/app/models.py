from datetime import datetime
from pydantic import BaseModel


class User(BaseModel):
    id: str | None = None
    email: str
    password_hash: str


class Task(BaseModel):
    id: str | None = None
    title: str
    description: str = ""
    user_id: str = ""
    created_at: datetime | None = None
