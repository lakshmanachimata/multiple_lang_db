package main

import (
	"log"
	"multi-lang-backend-go/internal/config"
	"multi-lang-backend-go/internal/server"
)

func main() {
	cfg := config.Load()
	srv := server.New(cfg)
	log.Printf("Go backend listening on :%s", cfg.Port)
	if err := srv.Run(); err != nil {
		log.Fatal(err)
	}
}
