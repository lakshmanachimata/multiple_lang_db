package service

import (
	"errors"
	"multi-lang-backend-go/internal/domain"
	"multi-lang-backend-go/internal/repository"
	"time"
)

var ErrTaskNotFound = errors.New("task not found")

type TaskService struct {
	repo *repository.Factory
}

func NewTaskService(repo *repository.Factory) *TaskService {
	return &TaskService{repo: repo}
}

func (s *TaskService) ListByUserID(userID string) ([]*domain.Task, error) {
	return s.repo.TaskRepository().FindByUserID(userID)
}

func (s *TaskService) Create(userID, title, description string) (*domain.Task, error) {
	task := &domain.Task{
		Title:       title,
		Description: description,
		UserID:      userID,
		CreatedAt:   time.Now(),
	}
	if err := s.repo.TaskRepository().Save(task); err != nil {
		return nil, err
	}
	return task, nil
}

func (s *TaskService) GetByID(id, userID string) (*domain.Task, error) {
	task, err := s.repo.TaskRepository().FindByID(id)
	if err != nil || task == nil {
		return nil, ErrTaskNotFound
	}
	if task.UserID != userID {
		return nil, ErrTaskNotFound
	}
	return task, nil
}

func (s *TaskService) Update(id, userID, title, description string) (*domain.Task, error) {
	existing, err := s.GetByID(id, userID)
	if err != nil {
		return nil, err
	}
	if title != "" {
		existing.Title = title
	}
	if description != "" {
		existing.Description = description
	}
	if err := s.repo.TaskRepository().Save(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *TaskService) Delete(id, userID string) error {
	if _, err := s.GetByID(id, userID); err != nil {
		return err
	}
	return s.repo.TaskRepository().DeleteByID(id)
}
