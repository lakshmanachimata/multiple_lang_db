import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.sql import UserModel, TaskModel, async_session
from app.models import User, Task
from app.repositories.base import UserRepository, TaskRepository


class UserRepositorySQL(UserRepository):
    async def save(self, user: User) -> User:
        async with async_session() as session:
            uid = user.id or str(uuid.uuid4())
            m = UserModel(id=uid, email=user.email, password_hash=user.password_hash)
            session.add(m)
            await session.commit()
            await session.refresh(m)
            return User(id=m.id, email=m.email, password_hash=m.password_hash)

    async def find_by_email(self, email: str) -> User | None:
        async with async_session() as session:
            r = await session.execute(select(UserModel).where(UserModel.email == email))
            m = r.scalar_one_or_none()
            if not m:
                return None
            return User(id=m.id, email=m.email, password_hash=m.password_hash)

    async def find_by_id(self, id: str) -> User | None:
        async with async_session() as session:
            r = await session.get(UserModel, id)
            if not r:
                return None
            return User(id=r.id, email=r.email, password_hash=r.password_hash)


class TaskRepositorySQL(TaskRepository):
    async def save(self, task: Task) -> Task:
        async with async_session() as session:
            tid = task.id or str(uuid.uuid4())
            created = task.created_at or datetime.utcnow()
            m = TaskModel(
                id=tid,
                title=task.title,
                description=task.description or "",
                user_id=task.user_id,
                created_at=created,
            )
            session.add(m)
            await session.commit()
            await session.refresh(m)
            return Task(
                id=m.id,
                title=m.title,
                description=m.description or "",
                user_id=m.user_id,
                created_at=m.created_at,
            )

    async def find_by_id(self, id: str) -> Task | None:
        async with async_session() as session:
            r = await session.get(TaskModel, id)
            if not r:
                return None
            return Task(
                id=r.id,
                title=r.title,
                description=r.description or "",
                user_id=r.user_id,
                created_at=r.created_at,
            )

    async def find_by_user_id(self, user_id: str) -> list[Task]:
        async with async_session() as session:
            r = await session.execute(select(TaskModel).where(TaskModel.user_id == user_id).order_by(TaskModel.created_at.desc()))
            rows = r.scalars().all()
            return [
                Task(id=m.id, title=m.title, description=m.description or "", user_id=m.user_id, created_at=m.created_at)
                for m in rows
            ]

    async def delete_by_id(self, id: str) -> None:
        async with async_session() as session:
            r = await session.get(TaskModel, id)
            if r:
                await session.delete(r)
                await session.commit()
