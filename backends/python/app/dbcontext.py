from contextvars import ContextVar

_db_type: ContextVar[str] = ContextVar("db_type", default="sql")

SQL = "sql"
MONGO = "mongo"


def set_db_type(value: str | None) -> None:
    if value and value.lower() == MONGO:
        _db_type.set(MONGO)
    else:
        _db_type.set(SQL)


def get_db_type() -> str:
    return _db_type.get()
