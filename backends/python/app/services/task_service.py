from datetime import datetime
from app.models import Task
from app.repositories.factory import get_task_repository


async def list_tasks(user_id: str) -> list[Task]:
    return await get_task_repository().find_by_user_id(user_id)


async def create_task(user_id: str, title: str, description: str) -> Task:
    task = Task(title=title, description=description or "", user_id=user_id, created_at=datetime.utcnow())
    return await get_task_repository().save(task)


async def get_task(task_id: str, user_id: str) -> Task:
    task = await get_task_repository().find_by_id(task_id)
    if not task or task.user_id != user_id:
        raise ValueError("task not found")
    return task


async def update_task(task_id: str, user_id: str, title: str | None, description: str | None) -> Task:
    task = await get_task(task_id, user_id)
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    return await get_task_repository().save(task)


async def delete_task(task_id: str, user_id: str) -> None:
    await get_task(task_id, user_id)
    await get_task_repository().delete_by_id(task_id)
