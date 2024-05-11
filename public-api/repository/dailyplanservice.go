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
	dailyPlanTable = "DailyPlan"
)

type DailyPlanIFace interface {
	Store(ctx context.Context, data entity.DailyPlan) error

	Delete(ctx context.Context, id string) error

	GetSpecific(ctx context.Context, id string) (*entity.DailyPlan, error)

	GetAllForUser(ctx context.Context, userId string) ([]entity.DailyPlan, error)
}

type DailyPlanRepo struct {
	DailyPlanIFace

	firestore firestore.Client
}

func (dpr *DailyPlanRepo) Store(ctx context.Context, data entity.DailyPlan) error {
	_, err := dpr.firestore.Collection(dailyPlanTable).Doc(data.ID).Set(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (dpr *DailyPlanRepo) Delete(ctx context.Context, id string) error {
	_, err := dpr.firestore.Collection(dailyPlanTable).Doc(id).Delete(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (dpr *DailyPlanRepo) GetSpecific(ctx context.Context, id string) (*entity.DailyPlan, error) {
	doc, err := dpr.firestore.Collection(dailyPlanTable).Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}

		return nil, err
	}

	result := entity.DailyPlan{}
	doc.DataTo(&result)
	return &result, nil
}

func (dpr *DailyPlanRepo) GetAllForUser(ctx context.Context, userId string) ([]entity.DailyPlan, error) {
	documentsIter := dpr.firestore.Collection(dailyPlanTable).Where("userId", "==", userId).Documents(ctx)

	results := []entity.DailyPlan{}
	for {
		doc, err := documentsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		testEntity := entity.DailyPlan{}
		doc.DataTo(&testEntity)

		results = append(results, testEntity)
	}

	return results, nil
}
