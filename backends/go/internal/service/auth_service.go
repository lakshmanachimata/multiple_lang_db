package service

import (
	"errors"
	"multi-lang-backend-go/internal/domain"
	"multi-lang-backend-go/internal/jwt"
	"multi-lang-backend-go/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

var ErrEmailExists = errors.New("email already registered")
var ErrInvalidCredentials = errors.New("invalid email or password")

type AuthService struct {
	repo *repository.Factory
	jwt  *jwt.Manager
}

func NewAuthService(repo *repository.Factory, jwt *jwt.Manager) *AuthService {
	return &AuthService{repo: repo, jwt: jwt}
}

func (s *AuthService) Register(email, password string) (string, error) {
	userRepo := s.repo.UserRepository()
	existing, _ := userRepo.FindByEmail(email)
	if existing != nil {
		return "", ErrEmailExists
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	user := &domain.User{Email: email, PasswordHash: string(hash)}
	if err := userRepo.Save(user); err != nil {
		return "", err
	}
	return s.jwt.Generate(user.ID, user.Email)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.repo.UserRepository().FindByEmail(email)
	if err != nil || user == nil {
		return "", ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", ErrInvalidCredentials
	}
	return s.jwt.Generate(user.ID, user.Email)
}
