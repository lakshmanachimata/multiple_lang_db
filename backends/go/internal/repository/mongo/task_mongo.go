package mongo

import (
	"context"
	"multi-lang-backend-go/internal/domain"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const taskColl = "tasks"

type TaskRepositoryMongo struct {
	coll *mongo.Collection
}

func NewTaskRepositoryMongo(client *mongo.Client) *TaskRepositoryMongo {
	return &TaskRepositoryMongo{coll: client.Database(dbName).Collection(taskColl)}
}

func (r *TaskRepositoryMongo) Save(task *domain.Task) error {
	if task.ID == "" {
		task.ID = uuid.New().String()
	}
	if task.CreatedAt.IsZero() {
		task.CreatedAt = time.Now()
	}
	doc := bson.M{
		"_id": task.ID, "title": task.Title, "description": task.Description,
		"userId": task.UserID, "createdAt": task.CreatedAt,
	}
	_, err := r.coll.ReplaceOne(context.Background(), bson.M{"_id": task.ID}, doc)
	if err != nil {
		_, err = r.coll.InsertOne(context.Background(), doc)
		return err
	}
	return nil
}

func (r *TaskRepositoryMongo) FindByID(id string) (*domain.Task, error) {
	var doc struct {
		ID          string    `bson:"_id"`
		Title       string    `bson:"title"`
		Description string    `bson:"description"`
		UserID      string    `bson:"userId"`
		CreatedAt   time.Time `bson:"createdAt"`
	}
	err := r.coll.FindOne(context.Background(), bson.M{"_id": id}).Decode(&doc)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &domain.Task{ID: doc.ID, Title: doc.Title, Description: doc.Description, UserID: doc.UserID, CreatedAt: doc.CreatedAt}, nil
}

func (r *TaskRepositoryMongo) FindByUserID(userID string) ([]*domain.Task, error) {
	cur, err := r.coll.Find(context.Background(), bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.Background())
	var tasks []*domain.Task
	for cur.Next(context.Background()) {
		var doc struct {
			ID          string    `bson:"_id"`
			Title       string    `bson:"title"`
			Description string    `bson:"description"`
			UserID      string    `bson:"userId"`
			CreatedAt   time.Time `bson:"createdAt"`
		}
		if err := cur.Decode(&doc); err != nil {
			return nil, err
		}
		tasks = append(tasks, &domain.Task{ID: doc.ID, Title: doc.Title, Description: doc.Description, UserID: doc.UserID, CreatedAt: doc.CreatedAt})
	}
	return tasks, nil
}

func (r *TaskRepositoryMongo) DeleteByID(id string) error {
	_, err := r.coll.DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}
