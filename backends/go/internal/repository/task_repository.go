package repository

import "multi-lang-backend-go/internal/domain"

type TaskRepository interface {
	Save(task *domain.Task) error
	FindByID(id string) (*domain.Task, error)
	FindByUserID(userID string) ([]*domain.Task, error)
	DeleteByID(id string) error
}
