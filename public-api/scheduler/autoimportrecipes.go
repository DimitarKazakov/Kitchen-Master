package scheduler

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"kitchenmaster/api"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"log"
	"net/http"
	"os"
	"strings"
	"sync/atomic"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
	"github.com/google/uuid"
)

func launchAutoImportRecipesScheduler(launchTime time.Time, additionalData string) {
	ctx := context.Background()
	firebase, err := api.ConnectFirebaseApp(ctx)
	if err != nil {
		return
	}

	firestore, err := firebase.Firestore(ctx)
	if err != nil {
		return
	}

	authClient, err := firebase.Auth(ctx)
	if err != nil {
		return
	}

	scheduleRepo := repository.NewCoreScheduler(*firestore)

	scheduleRepo.MarkRunning(ctx, recipeWebScraperTaskName)
	defer scheduleRepo.MarkCompleted(ctx, recipeWebScraperTaskName)

	config := elasticsearch.Config{
		Addresses: []string{
			os.Getenv("ELASTIC_URL"),
		},
		APIKey: os.Getenv("ELASTIC_API_KEY"),
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Username: os.Getenv("ELASTIC_USERNAME"),
		Password: os.Getenv("ELASTIC_PASSWORD"),
	}

	elasticSearchClient, err := elasticsearch.NewClient(config)
	if err != nil {
		return
	}

	recipeRepo := repository.NewRecipeRepository(*elasticSearchClient)

	allFiles, err := ioutil.ReadDir("./scheduler")
	if err != nil {
		return
	}

	jsonFiles := []string{}
	for _, file := range allFiles {
		fileName := file.Name()
		if !file.IsDir() && strings.HasPrefix(fileName, "recipes_") && strings.HasSuffix(fileName, ".json") {
			jsonFiles = append(jsonFiles, "./scheduler/"+fileName)
		}
	}

	usersRepo := repository.NewClientUserRepository(*firestore, *authClient)
	users, err := usersRepo.GetAll(ctx)
	if err != nil {
		return
	}

	for _, user := range users {
		if !user.AutoImportEnabled || user.Subscription == "FREE" {
			continue
		}

		for _, jsonFile := range jsonFiles {
			if contains(user.ImportedRecipes, jsonFile) {
				continue
			}

			err = importElasticSearch(elasticSearchClient, recipeRepo, jsonFile, user.ElasticIndex)
			if err != nil {
				return
			}

			user.ImportedRecipes = append(user.ImportedRecipes, jsonFile)
		}

		err = usersRepo.Store(ctx, user)
		if err != nil {
			return
		}
	}
}

func importElasticSearch(elasticSearchClient *elasticsearch.Client, recipeRepo repository.RecipeIFace, jsonFile string, indexName string) error {
	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Index:  indexName,           // The default index name
		Client: elasticSearchClient, // The Elasticsearch client
	})

	if err != nil {
		return err
	}

	file, _ := os.ReadFile(jsonFile)
	rawRecipes := make([]entity.RawRecipe, 0)
	json.Unmarshal(file, &rawRecipes)

	var countSuccessful uint64

	for _, rawRecipe := range rawRecipes {
		recipe := entity.Recipe{
			Name:            rawRecipe.Name,
			Description:     rawRecipe.Description,
			ImageUrl:        rawRecipe.ImageUrl,
			PreparationTime: rawRecipe.PreparationTime,
			CookingTime:     rawRecipe.CookingTime,
			AllTile:         rawRecipe.AllTile,
			Portions:        rawRecipe.Portions,
			Ingredients:     rawRecipe.Ingredients,
			Instructions:    rawRecipe.Instructions,
			Notes:           "",
		}

		mappedRecipe := recipeRepo.TagRecipe(recipe)
		documentId := uuid.New().String()
		mappedRecipe.ID = documentId
		data, err := json.Marshal(mappedRecipe)
		if err != nil {
			return err
		}

		err = bi.Add(
			context.Background(),
			esutil.BulkIndexerItem{
				Action:     "index",
				DocumentID: documentId,
				Body:       bytes.NewReader(data),
				OnSuccess: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem) {
					atomic.AddUint64(&countSuccessful, 1)
				},
				OnFailure: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem, err error) {
					if err != nil {
						log.Printf("ERROR: %s", err)
					} else {
						log.Printf("ERROR: %s: %s", res.Error.Type, res.Error.Reason)
					}
				},
			},
		)
		if err != nil {
			return err
		}
	}

	if err := bi.Close(context.Background()); err != nil {
		return err
	}

	biStats := bi.Stats()
	fmt.Println(biStats.NumAdded)
	fmt.Println(countSuccessful)
	fmt.Println(biStats.NumFailed)

	return nil
}

func contains(array []string, element string) bool {
	for _, item := range array {
		if item == element {
			return true
		}
	}
	return false
}
