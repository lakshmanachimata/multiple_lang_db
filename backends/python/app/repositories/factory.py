from app.dbcontext import get_db_type, MONGO
from app.repositories.sql_repo import UserRepositorySQL, TaskRepositorySQL
from app.repositories.mongo_repo import UserRepositoryMongo, TaskRepositoryMongo

_user_sql = UserRepositorySQL()
_task_sql = TaskRepositorySQL()
_user_mongo = UserRepositoryMongo()
_task_mongo = TaskRepositoryMongo()


def get_user_repository():
    if get_db_type() == MONGO:
        return _user_mongo
    return _user_sql


def get_task_repository():
    if get_db_type() == MONGO:
        return _task_mongo
    return _task_sql
