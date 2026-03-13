from pymongo import MongoClient
from app.config import MONGO_URI

mongo_client: MongoClient | None = None

try:
    mongo_client = MongoClient(MONGO_URI)
except Exception:
    mongo_client = None

DB_NAME = "taskdb"
