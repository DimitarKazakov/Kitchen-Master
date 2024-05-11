package repository

import (
	"context"
	"fmt"
	"kitchenmaster/entity"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

var (
	schedulerTable = "Scheduler"
)

type SchedulerIFace interface {
	Store(ctx context.Context, data entity.CoreScheduler) error

	GetSpecific(ctx context.Context, taskName string) (*entity.CoreScheduler, error)

	MarkRunning(ctx context.Context, taskName string) error

	MarkCompleted(ctx context.Context, taskName string) error
}

type SchedulerRepo struct {
	SchedulerIFace

	firestore firestore.Client
}

func (sr *SchedulerRepo) Store(ctx context.Context, data entity.CoreScheduler) error {
	_, err := sr.firestore.Collection(schedulerTable).Doc(data.ID).Set(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (sr *SchedulerRepo) GetSpecific(ctx context.Context, taskName string) (*entity.CoreScheduler, error) {
	tasksIter := sr.firestore.Collection(schedulerTable).Where("taskName", "==", taskName).Documents(ctx)

	results := []entity.CoreScheduler{}
	for {
		doc, err := tasksIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		testEntity := entity.CoreScheduler{}
		doc.DataTo(&testEntity)

		results = append(results, testEntity)
	}

	if len(results) == 0 {
		return nil, nil
	}

	return &results[0], nil
}

func (sr *SchedulerRepo) MarkRunning(ctx context.Context, taskName string) error {
	task, err := sr.GetSpecific(ctx, taskName)
	if err != nil {
		return err
	}

	if task == nil {
		return fmt.Errorf("no task with that name found")
	}

	task.IsRunningNow = true
	task.LastRunStart = sr.timeToString(time.Now().UTC())
	return sr.Store(ctx, *task)
}

func (sr *SchedulerRepo) MarkCompleted(ctx context.Context, taskName string) error {
	task, err := sr.GetSpecific(ctx, taskName)
	if err != nil {
		return err
	}

	if task == nil {
		return fmt.Errorf("no task with that name found")
	}

	task.IsRunningNow = false
	task.LastRunEnd = sr.timeToString(time.Now().UTC())
	return sr.Store(ctx, *task)
}

func (sr *SchedulerRepo) timeToString(theTime time.Time) string {
	result := theTime.Format(time.RFC3339Nano)
	return result
}
