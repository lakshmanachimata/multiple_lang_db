package domain

import "time"

type User struct {
	ID           string
	Email        string
	PasswordHash string
}

type Task struct {
	ID          string
	Title       string
	Description string
	UserID      string
	CreatedAt   time.Time
}
