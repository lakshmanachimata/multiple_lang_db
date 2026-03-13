from abc import ABC, abstractmethod
from app.models import User, Task


class UserRepository(ABC):
    @abstractmethod
    async def save(self, user: User) -> User: ...

    @abstractmethod
    async def find_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> User | None: ...


class TaskRepository(ABC):
    @abstractmethod
    async def save(self, task: Task) -> Task: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Task | None: ...

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> list[Task]: ...

    @abstractmethod
    async def delete_by_id(self, id: str) -> None: ...
