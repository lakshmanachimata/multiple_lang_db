from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.sql import func

from app.config import SQLITE_PATH

engine = create_async_engine(SQLITE_PATH, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)


class TaskModel(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


async def init_sql():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
