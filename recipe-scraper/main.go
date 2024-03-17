package main

import (
	"encoding/json"
	"fmt"
	"io"
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

const url = "https://recepti.gotvach.bg/"
const maxPage = 500     // NOTE: max is 3700
const maxRecipes = 5000 // NOTE: at what point the program should stop, max is 95000
const startFrom = 70    // NOTE: we reached here last time

type Recipe struct {
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	ImageUrl        string   `json:"imageUrl"`
	PreparationTime string   `json:"preparationTime"`
	CookingTime     string   `json:"cookingTime"`
	AllTile         string   `json:"allTime"`
	Portions        string   `json:"portions"`
	Ingredients     []string `json:"ingredients"`
	Instructions    []string `json:"instructions"`
}

var mutex sync.Mutex
var files []string = make([]string, 0)

func main() {
	// NOTE: register transporter for local files
	t := &http.Transport{}
	t.RegisterProtocol("file", http.NewFileTransport(http.Dir("/")))

	c := colly.NewCollector()
	c.WithTransport(t)

	allUrls := []string{}
	recipes := []Recipe{}
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
		recipe := Recipe{
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

	for i := startFrom; i < maxPage; i++ {
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
		os.WriteFile("recipes_1.json", recipeJson, 0644)
		if len(recipes) == maxRecipes {
			break
		}
	}

	fmt.Printf("Recipe count %d \n", len(recipes))
}

func downloadHtml(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalln(err)
	}

	//We Read the response body on the line below.
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
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
	return filePath
}

func getRecipePage(currentUrl string, c *colly.Collector) {
	if currentUrl == "" {
		return
	}
	fmt.Println("getting recipes from " + currentUrl)
	filePath := downloadHtml(currentUrl)
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}
	files = append(files, filePath)
	c.Visit("file://" + dir + "/" + filePath)
}

func getRecipeCount() int {
	file, _ := os.ReadFile("recipes.json")
	recipes := make([]Recipe, 0)
	json.Unmarshal(file, &recipes)
	return len(recipes)
}
