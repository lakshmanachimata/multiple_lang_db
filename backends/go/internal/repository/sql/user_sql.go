package sql

import (
	"database/sql"
	"multi-lang-backend-go/internal/domain"

	"github.com/google/uuid"
)

type UserRepositorySQL struct {
	db *sql.DB
}

func NewUserRepositorySQL(db *sql.DB) *UserRepositorySQL {
	return &UserRepositorySQL{db: db}
}

func (r *UserRepositorySQL) Save(user *domain.User) error {
	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	_, err := r.db.Exec(
		"INSERT OR REPLACE INTO users (id, email, password_hash) VALUES (?, ?, ?)",
		user.ID, user.Email, user.PasswordHash,
	)
	return err
}

func (r *UserRepositorySQL) FindByEmail(email string) (*domain.User, error) {
	var u domain.User
	err := r.db.QueryRow(
		"SELECT id, email, password_hash FROM users WHERE email = ?", email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepositorySQL) FindByID(id string) (*domain.User, error) {
	var u domain.User
	err := r.db.QueryRow(
		"SELECT id, email, password_hash FROM users WHERE id = ?", id,
	).Scan(&u.ID, &u.Email, &u.PasswordHash)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
