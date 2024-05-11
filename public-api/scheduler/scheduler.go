package scheduler

import (
	"context"
	"kitchenmaster/api"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"time"

	"cloud.google.com/go/firestore"
)

type Scheduler struct {
	scheduleRepo    repository.SchedulerIFace
	lastTick        time.Time
	launchFunctions map[string]func(time.Time, string)
	firestore       firestore.Client

	pollInterval time.Duration
}

const (
	schedulerPollIntervalInMinutes = 5
	recipeWebScraperTaskName       = "recipeWebScraper"
	autoImportRecipesTaskName      = "autoImportRecipes"
)

func RunScheduler() {
	ctx := context.Background()
	firebase, err := api.ConnectFirebaseApp(ctx)
	if err != nil {
		return
	}

	firestore, err := firebase.Firestore(ctx)
	if err != nil {
		return
	}

	scheduler := Scheduler{}
	scheduler.firestore = *firestore
	scheduler.pollInterval = schedulerPollIntervalInMinutes

	scheduler.initialise(ctx)

	scheduler.run(ctx)
}

// initialise loads all the items to be scheduled
func (s *Scheduler) initialise(ctx context.Context) {

	s.scheduleRepo = repository.NewCoreScheduler(s.firestore)
	s.lastTick = time.Now().UTC()

	s.launchFunctions = make(map[string]func(time.Time, string))
	s.launchFunctions[recipeWebScraperTaskName] = launchRecipeWebScraperScheduler
	s.launchFunctions[autoImportRecipesTaskName] = launchAutoImportRecipesScheduler

	s.clearIsRunningNow(ctx)
}

// clears all the is running now bits
func (s *Scheduler) clearIsRunningNow(ctx context.Context) {
	for taskName := range s.launchFunctions {

		schedule, err := s.scheduleRepo.GetSpecific(ctx, taskName)
		if err != nil {
			return
		}

		if schedule.IsRunningNow {
			schedule.IsRunningNow = false

			s.scheduleRepo.MarkCompleted(ctx, taskName)
		}

	}
}

func (s *Scheduler) run(ctx context.Context) {
	for {
		s.tick(ctx)

		select {
		case <-time.After(s.pollInterval * time.Minute):
		}

	}
}

func (s *Scheduler) tick(ctx context.Context) {

	for k := range s.launchFunctions {
		s.processItem(ctx, k)
	}

	s.lastTick = time.Now().UTC()
}

func (s *Scheduler) processItem(ctx context.Context, taskName string) {
	schedule, err := s.scheduleRepo.GetSpecific(ctx, taskName)

	if err != nil {
		return
	}

	if schedule == nil {
		return
	}

	needtoRun, configuredLaunchTime := s.needsToRun(*schedule)

	if needtoRun {
		launchFunc, ok := s.launchFunctions[taskName]

		if !ok {
			return
		} else {
			go launchFunc(configuredLaunchTime, schedule.AdditionalInfo)
		}
	}
}

func (s *Scheduler) needsToRun(schedule entity.CoreScheduler) (bool, time.Time) {
	needToRun := false
	configLaunchTime := time.Time{}

	if !schedule.Enabled {
		return false, configLaunchTime
	}

	if schedule.IsRunningNow {
		return false, configLaunchTime

	}

	now := time.Now().UTC()

	if schedule.Every != 0 {
		lastRunTime, err := StringToTime(schedule.LastRunEnd)
		if err == nil {
			timeToRun := lastRunTime.Add(time.Hour * time.Duration(schedule.Every))
			if timeToRun.Before(now) {
				needToRun = true
				configLaunchTime = now
			}
		}
	}

	return needToRun, configLaunchTime
}

func StringToTime(strTime string) (time.Time, error) {
	return time.Parse(time.RFC3339Nano, strTime)
}
