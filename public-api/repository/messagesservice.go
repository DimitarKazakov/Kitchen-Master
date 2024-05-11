package repository

import (
	"context"
	"kitchenmaster/entity"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	messageTable = "Messages"
)

type MessagesIFace interface {
	Store(ctx context.Context, data entity.Message) error

	Delete(ctx context.Context, id string) error

	GetSpecific(ctx context.Context, id string) (*entity.Message, error)

	GetAll(ctx context.Context) ([]entity.Message, error)
}

type MessagesRepo struct {
	MessagesIFace

	firestore firestore.Client
}

func (mr *MessagesRepo) Store(ctx context.Context, data entity.Message) error {
	_, err := mr.firestore.Collection(messageTable).Doc(data.ID).Set(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (mr *MessagesRepo) Delete(ctx context.Context, id string) error {
	_, err := mr.firestore.Collection(messageTable).Doc(id).Delete(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (mr *MessagesRepo) GetSpecific(ctx context.Context, id string) (*entity.Message, error) {
	doc, err := mr.firestore.Collection(messageTable).Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}

		return nil, err
	}

	result := entity.Message{}
	doc.DataTo(&result)
	return &result, nil
}

func (mr *MessagesRepo) GetAll(ctx context.Context) ([]entity.Message, error) {
	documentsIter := mr.firestore.Collection(messageTable).Documents(ctx)

	results := []entity.Message{}
	for {
		doc, err := documentsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		testEntity := entity.Message{}
		doc.DataTo(&testEntity)

		results = append(results, testEntity)
	}

	return results, nil
}
