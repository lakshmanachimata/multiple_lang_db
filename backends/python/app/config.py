import os

PORT = int(os.getenv("PORT", "8083"))
JWT_SECRET = os.getenv("JWT_SECRET", "your-256-bit-secret-key-for-jwt-signing-change-in-prod")
JWT_EXPIRATION_SECONDS = 86400  # 24h
SQLITE_PATH = os.getenv("SQLITE_PATH", "sqlite+aiosqlite:///./taskdb.sqlite")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
