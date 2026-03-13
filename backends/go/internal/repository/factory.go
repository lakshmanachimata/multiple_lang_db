package repository

import (
	"database/sql"
	"multi-lang-backend-go/internal/dbcontext"
	sqlrepo "multi-lang-backend-go/internal/repository/sql"
	mongorepo "multi-lang-backend-go/internal/repository/mongo"

	"go.mongodb.org/mongo-driver/mongo"
)

type Factory struct {
	userSQL   *sqlrepo.UserRepositorySQL
	userMongo *mongorepo.UserRepositoryMongo
	taskSQL   *sqlrepo.TaskRepositorySQL
	taskMongo *mongorepo.TaskRepositoryMongo
}

func NewFactory(db *sql.DB, mongoClient *mongo.Client) *Factory {
	return &Factory{
		userSQL:   sqlrepo.NewUserRepositorySQL(db),
		userMongo: mongorepo.NewUserRepositoryMongo(mongoClient),
		taskSQL:   sqlrepo.NewTaskRepositorySQL(db),
		taskMongo: mongorepo.NewTaskRepositoryMongo(mongoClient),
	}
}

func (f *Factory) UserRepository() UserRepository {
	if dbcontext.GetDbType() == dbcontext.Mongo {
		return f.userMongo
	}
	return f.userSQL
}

func (f *Factory) TaskRepository() TaskRepository {
	if dbcontext.GetDbType() == dbcontext.Mongo {
		return f.taskMongo
	}
	return f.taskSQL
}

