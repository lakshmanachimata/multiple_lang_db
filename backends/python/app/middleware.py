from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.dbcontext import set_db_type

HEADER_X_DB_TYPE = "X-DB-Type"


class DbTypeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        db_type = request.headers.get(HEADER_X_DB_TYPE)
        set_db_type(db_type)
        return await call_next(request)
