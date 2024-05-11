package repository

import (
	"context"
	"kitchenmaster/entity"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	clientUserTable = "ClientUser"
)

type ClientUserIFace interface {
	Store(ctx context.Context, data entity.ClientUser) error

	Delete(ctx context.Context, id string) error

	GetSpecific(ctx context.Context, id string) (*entity.ClientUser, error)

	GetAll(ctx context.Context) ([]entity.ClientUser, error)
}

type ClientUserRepo struct {
	ClientUserIFace

	firestore  firestore.Client
	authClient auth.Client
}

func (cr *ClientUserRepo) Store(ctx context.Context, data entity.ClientUser) error {
	_, err := cr.firestore.Collection(clientUserTable).Doc(data.ID).Set(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (cr *ClientUserRepo) Delete(ctx context.Context, id string) error {
	_, err := cr.firestore.Collection(clientUserTable).Doc(id).Delete(ctx)
	if err != nil {
		return err
	}

	return cr.authClient.DeleteUser(ctx, id)
}

func (cr *ClientUserRepo) GetSpecific(ctx context.Context, id string) (*entity.ClientUser, error) {
	doc, err := cr.firestore.Collection(clientUserTable).Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}

		return nil, err
	}

	result := entity.ClientUser{}
	doc.DataTo(&result)
	return &result, nil
}

func (cr *ClientUserRepo) GetAll(ctx context.Context) ([]entity.ClientUser, error) {
	documentsIter := cr.firestore.Collection(clientUserTable).Documents(ctx)

	results := []entity.ClientUser{}
	for {
		doc, err := documentsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		testEntity := entity.ClientUser{}
		doc.DataTo(&testEntity)

		results = append(results, testEntity)
	}

	return results, nil
}
