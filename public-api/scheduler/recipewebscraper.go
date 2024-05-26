package scheduler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"kitchenmaster/api"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
	"github.com/google/uuid"
)

var (
	url   = "https://recepti.gotvach.bg/"
	mutex sync.Mutex
	files []string = make([]string, 0)
)

type RecipeScraperAdditionalInfo struct {
	MaxPage    int `json:"maxPage"`
	StartPage  int `json:"startPage"`
	MaxRecipes int `json:"maxRecipes"`
}

func launchRecipeWebScraperScheduler(launchTime time.Time, additionalData string) {
	ctx := context.Background()
	firebase, err := api.ConnectFirebaseApp(ctx)
	if err != nil {
		return
	}

	firestore, err := firebase.Firestore(ctx)
	if err != nil {
		return
	}

	scheduleRepo := repository.NewCoreScheduler(*firestore)

	scheduleRepo.MarkRunning(ctx, recipeWebScraperTaskName)
	defer scheduleRepo.MarkCompleted(ctx, recipeWebScraperTaskName)

	files = make([]string, 0)
	additionalDataObj := RecipeScraperAdditionalInfo{}
	err = json.Unmarshal([]byte(additionalData), &additionalDataObj)
	if err != nil {
		return
	}

	// NOTE: no more pages to scrape
	if additionalDataObj.StartPage >= 3700 {
		return
	}

	// NOTE: register transporter for local files
	t := &http.Transport{}
	t.RegisterProtocol("file", http.NewFileTransport(http.Dir("/")))

	c := colly.NewCollector()
	c.WithTransport(t)

	allUrls := []string{}
	recipes := []entity.RawRecipe{}
	// NOTE: config to read html of the main pages
	c.OnHTML("div.rprev > div > a.title", func(e *colly.HTMLElement) {
		mutex.Lock()
		defer mutex.Unlock()
		href := e.Attr("href")
		if href != "" {
			allUrls = append(allUrls, e.Attr("href"))
		}
	})

	// NOTE: transform recipe html to struct
	c.OnHTML("#recEntity > div.combocolumn.mr", func(e *colly.HTMLElement) {
		mutex.Lock()
		defer mutex.Unlock()

		prepTimes := e.ChildText("div.indi > div.icb-prep")
		allTimes := e.ChildText("div.indi > div.icb-tot")
		portions := e.ChildText("div.indi > div.icb-fak")
		imageUrl := e.ChildAttr("#gall > img", "src")
		description := e.ChildText("#recContent > div.description")

		ingredients := []string{}
		instructions := []string{}

		e.ForEach("#recContent > section > ul > li", func(i int, e *colly.HTMLElement) {
			ingredients = append(ingredients, e.Text)
		})

		e.ForEach("#recContent > div.text > p", func(i int, e *colly.HTMLElement) {
			instructions = append(instructions, e.Text)
		})

		parsedPrepTimes := strings.Split(prepTimes, ".")
		prepTime := ""
		cookingTime := ""
		if len(parsedPrepTimes) > 0 {
			prepTime = strings.Replace(parsedPrepTimes[0], "Приготвяне", "", 1)
		}
		if len(parsedPrepTimes) > 1 {
			cookingTime = strings.Replace(parsedPrepTimes[1], "Готвене", "", 1)
		}
		recipe := entity.RawRecipe{
			Name:            e.ChildText("h1"),
			Description:     description,
			ImageUrl:        url + imageUrl,
			PreparationTime: prepTime,
			CookingTime:     cookingTime,
			AllTile:         strings.Replace(allTimes, "Общо", "", 1),
			Portions:        strings.Replace(portions, "Порции", "", 1),
			Ingredients:     ingredients,
			Instructions:    instructions,
		}

		recipes = append(recipes, recipe)
	})

	for i := additionalDataObj.StartPage; i < additionalDataObj.MaxPage; i++ {
		// NOTE: get all links for the recipe pages and wait
		fmt.Printf("READING PAGE %d \n", i)
		getRecipePage(url+strconv.Itoa(i)+"?=6", c)

		c.Wait()

		for _, p := range files {
			os.Remove(p)
		}

		files = make([]string, 0)

		for _, recipeUrl := range allUrls {
			time.Sleep(time.Second)
			getRecipePage(recipeUrl, c)
		}

		allUrls = make([]string, 0)

		c.Wait()
		for _, p := range files {
			os.Remove(p)
		}

		files = make([]string, 0)
		recipeJson, _ := json.Marshal(recipes)
		jsonFile := fmt.Sprintf("recipes_%s.json", uuid.New().String())
		os.WriteFile(jsonFile, recipeJson, 0644)
		if len(recipes) == additionalDataObj.MaxRecipes {
			break
		}
	}

	taskInfo, err := scheduleRepo.GetSpecific(ctx, recipeWebScraperTaskName)
	if err != nil {
		return
	}

	// NOTE: every time we move 10 pages
	additionalDataObj.StartPage = additionalDataObj.MaxPage
	additionalDataObj.MaxPage = additionalDataObj.MaxPage + 10
	jsonInfo, _ := json.Marshal(additionalDataObj)
	taskInfo.AdditionalInfo = string(jsonInfo)
	err = scheduleRepo.Store(ctx, *taskInfo)
	if err != nil {
		return
	}

	fmt.Printf("Recipe count %d \n", len(recipes))
}

func downloadHtml(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}

	//We Read the response body on the line below.
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	fileID := uuid.New().String()
	filePath := fileID + ".html"
	file, err := os.Create(filePath)
	if err != nil {
		log.Fatalln(err)
	}
	defer file.Close()

	file.Write(body)
	file.Sync()
	return filePath, nil
}

func getRecipePage(currentUrl string, c *colly.Collector) {
	if currentUrl == "" {
		return
	}
	fmt.Println("getting recipes from " + currentUrl)
	filePath, err := downloadHtml(currentUrl)
	if err != nil {
		return
	}

	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	files = append(files, filePath)
	c.Visit("file://" + dir + "/" + filePath)
}
