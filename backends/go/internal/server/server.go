package server

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"multi-lang-backend-go/internal/config"
	"multi-lang-backend-go/internal/handler"
	"multi-lang-backend-go/internal/jwt"
	"multi-lang-backend-go/internal/middleware"
	"multi-lang-backend-go/internal/repository"
	"multi-lang-backend-go/internal/service"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const swaggerHTMLGo = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>`

type Server struct {
	cfg    *config.Config
	engine *gin.Engine
}

func New(cfg *config.Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	engine.Use(gin.Recovery())

	db, err := sql.Open("sqlite3", cfg.SQLitePath)
	if err != nil {
		panic(fmt.Sprintf("sqlite open: %v", err))
	}
	if err := initSQL(db); err != nil {
		panic(fmt.Sprintf("sqlite init: %v", err))
	}

	ctx := options.Client().ApplyURI(cfg.MongoURI)
	mongoClient, err := mongo.Connect(context.Background(), ctx)
	if err != nil {
		panic(fmt.Sprintf("mongo connect: %v", err))
	}

	factory := repository.NewFactory(db, mongoClient)
	jwtManager := jwt.NewManager(cfg.JWTSecret, 86400000) // 24h
	authSvc := service.NewAuthService(factory, jwtManager)
	taskSvc := service.NewTaskService(factory)
	authHandler := handler.NewAuthHandler(authSvc)
	taskHandler := handler.NewTaskHandler(taskSvc)

	engine.Use(middleware.DbType())

	engine.GET("/openapi.json", func(c *gin.Context) {
		data, err := os.ReadFile("openapi.json")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "openapi.json not found"})
			return
		}
		c.Data(http.StatusOK, "application/json", data)
	})
	engine.GET("/docs", func(c *gin.Context) {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, swaggerHTMLGo)
	})

	api := engine.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}
	tasks := api.Group("/tasks")
	tasks.Use(middleware.JwtAuth(jwtManager))
	{
		tasks.GET("", taskHandler.List)
		tasks.POST("", taskHandler.Create)
		tasks.GET("/:id", taskHandler.Get)
		tasks.PUT("/:id", taskHandler.Update)
		tasks.DELETE("/:id", taskHandler.Delete)
	}

	return &Server{cfg: cfg, engine: engine}
}

func (s *Server) Run() error {
	port := s.cfg.Port
	if _, err := strconv.Atoi(port); err != nil {
		port = "8082"
	}
	return s.engine.Run(":" + port)
}

func initSQL(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			user_id TEXT NOT NULL,
			created_at DATETIME
		);
	`)
	return err
}
