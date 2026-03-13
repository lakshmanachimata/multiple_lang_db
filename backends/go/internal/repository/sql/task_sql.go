package sql

import (
	"database/sql"
	"multi-lang-backend-go/internal/domain"

	"github.com/google/uuid"
)

type TaskRepositorySQL struct {
	db *sql.DB
}

func NewTaskRepositorySQL(db *sql.DB) *TaskRepositorySQL {
	return &TaskRepositorySQL{db: db}
}

func (r *TaskRepositorySQL) Save(task *domain.Task) error {
	if task.ID == "" {
		task.ID = uuid.New().String()
	}
	_, err := r.db.Exec(
		"INSERT OR REPLACE INTO tasks (id, title, description, user_id, created_at) VALUES (?, ?, ?, ?, ?)",
		task.ID, task.Title, task.Description, task.UserID, task.CreatedAt,
	)
	return err
}

func (r *TaskRepositorySQL) FindByID(id string) (*domain.Task, error) {
	var t domain.Task
	err := r.db.QueryRow(
		"SELECT id, title, description, user_id, created_at FROM tasks WHERE id = ?", id,
	).Scan(&t.ID, &t.Title, &t.Description, &t.UserID, &t.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TaskRepositorySQL) FindByUserID(userID string) ([]*domain.Task, error) {
	rows, err := r.db.Query(
		"SELECT id, title, description, user_id, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tasks []*domain.Task
	for rows.Next() {
		var t domain.Task
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.UserID, &t.CreatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, &t)
	}
	return tasks, nil
}

func (r *TaskRepositorySQL) DeleteByID(id string) error {
	_, err := r.db.Exec("DELETE FROM tasks WHERE id = ?", id)
	return err
}
