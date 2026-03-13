import uuid
from datetime import datetime

from app.db.mongo import mongo_client, DB_NAME
from app.models import User, Task
from app.repositories.base import UserRepository, TaskRepository

if mongo_client:
    _db = mongo_client[DB_NAME]
    _users = _db["users"]
    _tasks = _db["tasks"]
else:
    _users = _tasks = None


class UserRepositoryMongo(UserRepository):
    async def save(self, user: User) -> User:
        if not _users:
            raise RuntimeError("MongoDB not connected")
        uid = user.id or str(uuid.uuid4())
        _users.replace_one(
            {"_id": uid},
            {"_id": uid, "email": user.email, "passwordHash": user.password_hash},
            upsert=True,
        )
        return User(id=uid, email=user.email, password_hash=user.password_hash)

    async def find_by_email(self, email: str) -> User | None:
        if not _users:
            return None
        doc = _users.find_one({"email": email})
        if not doc:
            return None
        return User(id=doc["_id"], email=doc["email"], password_hash=doc["passwordHash"])

    async def find_by_id(self, id: str) -> User | None:
        if not _users:
            return None
        doc = _users.find_one({"_id": id})
        if not doc:
            return None
        return User(id=doc["_id"], email=doc["email"], password_hash=doc["passwordHash"])


class TaskRepositoryMongo(TaskRepository):
    async def save(self, task: Task) -> Task:
        if not _tasks:
            raise RuntimeError("MongoDB not connected")
        tid = task.id or str(uuid.uuid4())
        created = task.created_at or datetime.utcnow()
        _tasks.replace_one(
            {"_id": tid},
            {
                "_id": tid,
                "title": task.title,
                "description": task.description or "",
                "userId": task.user_id,
                "createdAt": created,
            },
            upsert=True,
        )
        return Task(id=tid, title=task.title, description=task.description or "", user_id=task.user_id, created_at=created)

    async def find_by_id(self, id: str) -> Task | None:
        if not _tasks:
            return None
        doc = _tasks.find_one({"_id": id})
        if not doc:
            return None
        return Task(
            id=doc["_id"],
            title=doc["title"],
            description=doc.get("description", ""),
            user_id=doc["userId"],
            created_at=doc.get("createdAt"),
        )

    async def find_by_user_id(self, user_id: str) -> list[Task]:
        if not _tasks:
            return []
        cursor = _tasks.find({"userId": user_id}).sort("createdAt", -1)
        return [
            Task(
                id=d["_id"],
                title=d["title"],
                description=d.get("description", ""),
                user_id=d["userId"],
                created_at=d.get("createdAt"),
            )
            for d in cursor
        ]

    async def delete_by_id(self, id: str) -> None:
        if _tasks:
            _tasks.delete_one({"_id": id})
