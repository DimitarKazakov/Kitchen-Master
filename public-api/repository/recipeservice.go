package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"kitchenmaster/entity"
	"regexp"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
	"github.com/google/uuid"
)

var (
	recipeIndex = "search-recipe"
)

type RecipeIFace interface {
	CreateIndex(uuid string) error

	GetIndexName(uuid string) string

	DeleteIndex(index string) error

	Insert(ctx context.Context, index string, data entity.Recipe) error

	Update(ctx context.Context, index string, id string, data entity.Recipe) error

	Delete(ctx context.Context, index string, id string) error

	GetSpecific(ctx context.Context, index string, id string) (*entity.Recipe, error)

	Search(ctx context.Context, index string, limit *int, offset *int, search *string) ([]entity.Recipe, int, error)

	TagRecipe(recipe entity.Recipe) entity.Recipe
}

type RecipeRepo struct {
	RecipeIFace

	elastic elasticsearch.Client
}

func (rr *RecipeRepo) GetIndexName(uuid string) string {
	return recipeIndex + "-" + uuid
}

func (rr *RecipeRepo) DeleteIndex(index string) error {
	res, err := rr.elastic.Indices.Exists([]string{index})
	if err != nil {
		return fmt.Errorf("cannot check index existence: %w", err)
	}
	if res.IsError() {
		return fmt.Errorf("error in index exists response: %s", res.String())
	}

	res, err = rr.elastic.Indices.Delete([]string{index})
	if err != nil {
		return fmt.Errorf("cannot delete index: %w", err)
	}
	if res.IsError() {
		return fmt.Errorf("error in index delete response: %s", res.String())
	}

	return nil
}

func (rr *RecipeRepo) CreateIndex(index string) error {
	res, err := rr.elastic.Indices.Exists([]string{index})
	if err != nil {
		return fmt.Errorf("cannot check index existence: %w", err)
	}
	if res.StatusCode == 200 {
		return nil
	}
	if res.StatusCode != 404 {
		return fmt.Errorf("error in index existence response: %s", res.String())
	}

	res, err = rr.elastic.Indices.Create(index)
	if err != nil {
		return fmt.Errorf("cannot create index: %w", err)
	}
	if res.IsError() {
		return fmt.Errorf("error in index creation response: %s", res.String())
	}

	return nil
}

func (rr *RecipeRepo) Insert(ctx context.Context, index string, data entity.Recipe) error {
	data = rr.TagRecipe(data)
	documentId := uuid.New().String()
	data.ID = documentId
	jsonBody, _ := json.Marshal(data)

	request := esapi.CreateRequest{
		Index:      index,
		DocumentID: documentId,
		Body:       bytes.NewReader(jsonBody),
	}

	response, err := request.Do(ctx, &rr.elastic)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode == 409 {
		return fmt.Errorf("elastic search returned conflict 409")
	}

	if response.IsError() {
		return fmt.Errorf("insert: response: %s", response.String())
	}

	return nil
}

func (rr *RecipeRepo) Update(ctx context.Context, index string, id string, data entity.Recipe) error {
	data = rr.TagRecipe(data)
	data.ID = id
	jsonBody, _ := json.Marshal(data)

	request := esapi.UpdateRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader([]byte(fmt.Sprintf(`{"doc":%s}`, jsonBody))),
	}

	response, err := request.Do(ctx, &rr.elastic)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode == 404 {
		return fmt.Errorf("elastic search returned not found 404")
	}

	if response.IsError() {
		return fmt.Errorf("insert: response: %s", response.String())
	}

	return nil
}

func (rr *RecipeRepo) Delete(ctx context.Context, index string, id string) error {
	request := esapi.DeleteRequest{
		Index:      index,
		DocumentID: id,
	}

	res, err := request.Do(ctx, &rr.elastic)
	if err != nil {
		return fmt.Errorf("delete: request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode == 404 {
		return fmt.Errorf("elastic search returned not found 404")
	}

	if res.IsError() {
		return fmt.Errorf("delete: response: %s", res.String())
	}

	return nil
}

func (rr *RecipeRepo) GetSpecific(ctx context.Context, index string, id string) (*entity.Recipe, error) {
	request := esapi.GetRequest{
		Index:      index,
		DocumentID: id,
	}

	res, err := request.Do(ctx, &rr.elastic)
	if err != nil {
		return nil, fmt.Errorf("find one: request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode == 404 {
		return nil, nil
	}

	if res.IsError() {
		return nil, fmt.Errorf("find one: response: %s", res.String())
	}

	var (
		recipe entity.Recipe
		body   entity.Document
	)
	body.Source = &recipe

	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("find one: decode: %w", err)
	}

	return &recipe, nil
}

func (rr *RecipeRepo) Search(ctx context.Context, index string, limit *int, offset *int, search *string) ([]entity.Recipe, int, error) {
	request := esapi.SearchRequest{
		Index: []string{index},
	}

	if search != nil && *search != "" {
		query := fmt.Sprintf(`{"query": {"multi_match": {"query": "%s", "fields": ["name","description","instructions","ingredients","tags"]}}}`, *search)
		request.Body = strings.NewReader(query)
	}

	if limit != nil {
		request.Size = limit
	}

	if offset != nil {
		request.From = offset
	}

	res, err := request.Do(ctx, &rr.elastic)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, 0, fmt.Errorf("search response error: %s", res.String())
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, 0, err
	}

	searchHits := entity.SearchHits{}

	err = json.Unmarshal(body, &searchHits)
	if err != nil {
		return nil, 0, err
	}

	recipes := []entity.Recipe{}
	for _, hit := range searchHits.Hits.Hits {
		recipes = append(recipes, *hit.Source)
	}

	return recipes, searchHits.Hits.Total.Value, nil
}

func (rr *RecipeRepo) TagRecipe(recipe entity.Recipe) entity.Recipe {
	tags := []string{
		"закуска", "обяд", "вечеря", "десерт", "салата", "разядка", "коктейл", "супа", "веган", "вегетарианск", "месо", "риба", "пиле", "свин", "телеш", "шоколад", "бонбон", "кекс", "торт", "крем",
	}
	recipeTagsMap := map[string]bool{}

	for _, tag := range tags {
		regEx := fmt.Sprintf("^(%s)(\\S)*", tag)
		match, _ := regexp.MatchString(regEx, strings.ToLower(recipe.Name))
		if match {
			recipeTagsMap[tag] = true
			continue
		}

		match, _ = regexp.MatchString(regEx, strings.ToLower(recipe.Description))
		if match {
			recipeTagsMap[tag] = true
			continue
		}

		for _, ingredient := range recipe.Ingredients {
			match, _ = regexp.MatchString(regEx, strings.ToLower(ingredient))
			if match {
				recipeTagsMap[tag] = true
				break
			}
		}

		if recipeTagsMap[tag] {
			continue
		}

		for _, instuction := range recipe.Instructions {
			match, _ = regexp.MatchString(regEx, strings.ToLower(instuction))
			if match {
				recipeTagsMap[tag] = true
				break
			}
		}
	}

	recipeTags := []string{}
	for mappedTags := range recipeTagsMap {
		tagName := mappedTags
		if mappedTags == "пиле" {
			tagName = "пилешко"
			recipeTags = append(recipeTags, "месо")
		}

		if mappedTags == "свин" {
			tagName = "свинско"
			recipeTags = append(recipeTags, "месо")
		}

		if mappedTags == "телеш" {
			tagName = "телешко"
			recipeTags = append(recipeTags, "месо")
		}

		if mappedTags == "риба" {
			recipeTags = append(recipeTags, "месо")
		}

		if mappedTags == "вегетарианск" {
			tagName = "вегетарианскo"
		}

		if mappedTags == "шоколад" {
			recipeTags = append(recipeTags, "десерт")
		}

		if mappedTags == "бонбон" {
			tagName = "бонбони"
			recipeTags = append(recipeTags, "десерт")
		}

		if mappedTags == "кекс" {
			recipeTags = append(recipeTags, "десерт")
		}

		if mappedTags == "крем" {
			recipeTags = append(recipeTags, "десерт")
		}

		if mappedTags == "торт" {
			tagName = "торта"
			recipeTags = append(recipeTags, "десерт")
		}

		recipeTags = append(recipeTags, tagName)
	}

	recipe.Tags = recipeTags
	if recipe.ImageUrl == "" {
		recipe.ImageUrl = "https://tracksideflex.cdnflexcatering.com/themes/frontend/default/images/img-placeholder.png"
	}

	return recipe
}
