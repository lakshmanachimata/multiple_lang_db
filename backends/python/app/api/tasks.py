from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.jwt import decode_token
from app.services import task_service

router = APIRouter()
security = HTTPBearer(auto_error=True)


class TaskRequest(BaseModel):
    title: str
    description: str = ""


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="invalid token")
    return payload["sub"]


@router.get("")
async def list_tasks(user_id: str = Depends(get_current_user_id)):
    return await task_service.list_tasks(user_id)


@router.post("", status_code=201)
async def create_task(req: TaskRequest, user_id: str = Depends(get_current_user_id)):
    return await task_service.create_task(user_id, req.title, req.description)


@router.get("/{task_id}")
async def get_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return await task_service.get_task(task_id, user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="task not found")


@router.put("/{task_id}")
async def update_task(task_id: str, req: TaskRequest, user_id: str = Depends(get_current_user_id)):
    try:
        return await task_service.update_task(task_id, user_id, req.title, req.description)
    except ValueError:
        raise HTTPException(status_code=404, detail="task not found")


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        await task_service.delete_task(task_id, user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="task not found")
