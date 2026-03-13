package config

import (
	"os"
)

type Config struct {
	Port       string
	JWTSecret  string
	SQLitePath string
	MongoURI   string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-256-bit-secret-key-for-jwt-signing-change-in-prod"
	}
	sqlitePath := os.Getenv("SQLITE_PATH")
	if sqlitePath == "" {
		sqlitePath = "file:taskdb.sqlite?mode=memory&cache=shared"
	}
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	return &Config{
		Port:       port,
		JWTSecret:   jwtSecret,
		SQLitePath: sqlitePath,
		MongoURI:   mongoURI,
	}
}
