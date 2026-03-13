package mongo

import (
	"context"
	"multi-lang-backend-go/internal/domain"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const dbName = "taskdb"
const userColl = "users"

type UserRepositoryMongo struct {
	coll *mongo.Collection
}

func NewUserRepositoryMongo(client *mongo.Client) *UserRepositoryMongo {
	return &UserRepositoryMongo{coll: client.Database(dbName).Collection(userColl)}
}

func (r *UserRepositoryMongo) Save(user *domain.User) error {
	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	doc := bson.M{"_id": user.ID, "email": user.Email, "passwordHash": user.PasswordHash}
	_, err := r.coll.ReplaceOne(context.Background(), bson.M{"_id": user.ID}, doc)
	if err != nil {
		_, err = r.coll.InsertOne(context.Background(), doc)
		return err
	}
	return nil
}

func (r *UserRepositoryMongo) FindByEmail(email string) (*domain.User, error) {
	var doc struct {
		ID           string `bson:"_id"`
		Email        string `bson:"email"`
		PasswordHash string `bson:"passwordHash"`
	}
	err := r.coll.FindOne(context.Background(), bson.M{"email": email}).Decode(&doc)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &domain.User{ID: doc.ID, Email: doc.Email, PasswordHash: doc.PasswordHash}, nil
}

func (r *UserRepositoryMongo) FindByID(id string) (*domain.User, error) {
	var doc struct {
		ID           string `bson:"_id"`
		Email        string `bson:"email"`
		PasswordHash string `bson:"passwordHash"`
	}
	err := r.coll.FindOne(context.Background(), bson.M{"_id": id}).Decode(&doc)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &domain.User{ID: doc.ID, Email: doc.Email, PasswordHash: doc.PasswordHash}, nil
}
