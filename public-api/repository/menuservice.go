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
	menuTable = "Menu"
)

type MenuIFace interface {
	Store(ctx context.Context, data entity.Menu) error

	Delete(ctx context.Context, id string) error

	GetSpecific(ctx context.Context, id string) (*entity.Menu, error)

	GetAllForUser(ctx context.Context, userId string) ([]entity.Menu, error)
}

type MenuRepo struct {
	MenuIFace

	firestore firestore.Client
}

func (mr *MenuRepo) Store(ctx context.Context, data entity.Menu) error {
	_, err := mr.firestore.Collection(menuTable).Doc(data.ID).Set(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (mr *MenuRepo) Delete(ctx context.Context, id string) error {
	_, err := mr.firestore.Collection(menuTable).Doc(id).Delete(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (mr *MenuRepo) GetSpecific(ctx context.Context, id string) (*entity.Menu, error) {
	doc, err := mr.firestore.Collection(menuTable).Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}

		return nil, err
	}

	result := entity.Menu{}
	doc.DataTo(&result)
	return &result, nil
}

func (mr *MenuRepo) GetAllForUser(ctx context.Context, userId string) ([]entity.Menu, error) {
	documentsIter := mr.firestore.Collection(menuTable).Where("userId", "==", userId).Documents(ctx)

	results := []entity.Menu{}
	for {
		doc, err := documentsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		testEntity := entity.Menu{}
		doc.DataTo(&testEntity)

		results = append(results, testEntity)
	}

	return results, nil
}
