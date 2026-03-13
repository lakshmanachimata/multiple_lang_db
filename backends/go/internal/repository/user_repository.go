package repository

import "multi-lang-backend-go/internal/domain"

type UserRepository interface {
	Save(user *domain.User) error
	FindByEmail(email string) (*domain.User, error)
	FindByID(id string) (*domain.User, error)
}
