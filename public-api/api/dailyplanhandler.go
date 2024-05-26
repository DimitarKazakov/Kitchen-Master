package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"kitchenmaster/entity"
	"kitchenmaster/repository"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type dailyPlanHandler struct {
	API
}

type dailyPlanStoreRequest struct {
	Name string `firestore:"name" json:"name"`
	Day  string `firestore:"day" json:"day"`

	Breakfast *entity.MealPlan `firestore:"breakfast" json:"breakfast,omitempty" validate:"optional"`
	Lunch     *entity.MealPlan `firestore:"lunch" json:"lunch,omitempty" validate:"optional"`
	Dinner    *entity.MealPlan `firestore:"dinner" json:"dinner,omitempty" validate:"optional"`
}

func RespondDailyPlan(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&dailyPlanHandler{}, writer, request, true)
}

func (h *dailyPlanHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	dailyPlanIdParam := "dailyPlanId"

	switch request.Method {

	case http.MethodGet:
		vars := mux.Vars(request)
		dailyPlanId, exists := vars[dailyPlanIdParam]
		if exists {
			return h.handleGetSpecific(dailyPlanId)
		}

		return h.handleGetAll()
	case http.MethodPost:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		return h.handlePost(*body, request)
	case http.MethodPut:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		vars := mux.Vars(request)
		dailyPlanId, exists := vars[dailyPlanIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handlePut(dailyPlanId, *body)
	case http.MethodDelete:
		vars := mux.Vars(request)
		dailyPlanId, exists := vars[dailyPlanIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handleDelete(dailyPlanId)
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

func (h *dailyPlanHandler) handleBody(request *http.Request) (*dailyPlanStoreRequest, error) {
	var body dailyPlanStoreRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	images := map[string]string{}
	if body.Breakfast != nil {
		for _, recipe := range body.Breakfast.Recipes {
			images[recipe.Name] = recipe.ImageUrl
		}
	}

	if body.Lunch != nil {
		for _, recipe := range body.Lunch.Recipes {
			images[recipe.Name] = recipe.ImageUrl
		}
	}

	if body.Dinner != nil {
		for _, recipe := range body.Dinner.Recipes {
			images[recipe.Name] = recipe.ImageUrl
		}
	}

	HTMLSanitizer(&body)

	if body.Breakfast != nil {
		newRecipes := []entity.Recipe{}
		for _, recipe := range body.Breakfast.Recipes {
			recipe.ImageUrl = images[recipe.Name]
			newRecipes = append(newRecipes, recipe)
		}

		body.Breakfast.Recipes = newRecipes
	}

	if body.Lunch != nil {
		newRecipes := []entity.Recipe{}
		for _, recipe := range body.Lunch.Recipes {
			recipe.ImageUrl = images[recipe.Name]
			newRecipes = append(newRecipes, recipe)
		}

		body.Lunch.Recipes = newRecipes
	}

	if body.Dinner != nil {
		newRecipes := []entity.Recipe{}
		for _, recipe := range body.Dinner.Recipes {
			recipe.ImageUrl = images[recipe.Name]
			newRecipes = append(newRecipes, recipe)
		}

		body.Dinner.Recipes = newRecipes
	}

	if body.Name == "" {
		return nil, fmt.Errorf("name cannot be empty")
	}

	if body.Day == "" {
		return nil, fmt.Errorf("day cannot be empty")
	}

	if body.Breakfast == nil && body.Lunch == nil && body.Dinner == nil {
		return nil, fmt.Errorf("you should specify at least one meal")
	}

	return &body, nil
}

// dailyPlanHandler.handleGetSpecific godoc
// @Summary      Get specific daily plan
// @Description  Get specific daily plan
// @Param        dailyPlanId path string true "dailyPlanId"
// @Tags         Daily Plan
// @Produce      json
// @Success      200  {object}  entity.DailyPlan
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /dailyPlan/{dailyPlanId} [get]
// @Security 	 BearerAuth
func (h *dailyPlanHandler) handleGetSpecific(dailyPlanId string) APIResponse {
	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	dailyPlan, err := dailyPlanRepo.GetSpecific(h.Ctx, dailyPlanId)

	if err != nil {
		return DefaultInternalServerError()
	}

	if dailyPlan == nil {
		return DefaultNotFoundError()
	}

	json, _ := json.Marshal(dailyPlan)
	return OKContentType(json, ContentTypeJSON)
}

// dailyPlanHandler.handleGetAll godoc
// @Summary      Get all daily plans for user
// @Description  Get all daily plans for user
// @Tags         Daily Plan
// @Produce      json
// @Success      200  {object}  []entity.DailyPlan
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /dailyPlan [get]
// @Security 	 BearerAuth
func (h *dailyPlanHandler) handleGetAll() APIResponse {
	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	dailyPlans, err := dailyPlanRepo.GetAllForUser(h.Ctx, h.Session.UID)

	if err != nil {
		return DefaultInternalServerError()
	}

	json, _ := json.Marshal(dailyPlans)
	return OKContentType(json, ContentTypeJSON)
}

// dailyPlanHandler.handlePost godoc
// @Summary      Create a daily plan
// @Description  Create a daily plan
// @Param        createRecipes query string true "createRecipes"
// @Tags         Daily Plan
// @Produce      json
// @Param 		 request body dailyPlanStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /dailyPlan [post]
// @Security 	 BearerAuth
func (h *dailyPlanHandler) handlePost(body dailyPlanStoreRequest, request *http.Request) APIResponse {
	createRecipesParam := GetParameterFromRequest(request, "createRecipes")

	if createRecipesParam == "true" {
		recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
		clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
		clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
		if err != nil {
			return DefaultInternalServerError()
		}

		recipes := []entity.Recipe{}
		if body.Breakfast != nil {
			recipes = append(recipes, body.Breakfast.Recipes...)
		}

		if body.Lunch != nil {
			recipes = append(recipes, body.Lunch.Recipes...)
		}

		if body.Dinner != nil {
			recipes = append(recipes, body.Dinner.Recipes...)
		}

		for _, recipe := range recipes {
			err = recipeRepo.Insert(h.Ctx, clientUser.ElasticIndex, entity.Recipe{
				ID:              "",
				Name:            recipe.Name,
				Description:     recipe.Description,
				ImageUrl:        recipe.ImageUrl,
				Ingredients:     recipe.Ingredients,
				Instructions:    recipe.Instructions,
				Tags:            []string{},
				PreparationTime: recipe.PreparationTime,
				CookingTime:     recipe.CookingTime,
				AllTile:         recipe.AllTile,
				Portions:        recipe.Portions,
				Notes:           recipe.Notes,
			})

			if err != nil {
				return DefaultInternalServerError()
			}
		}
	}

	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	err := dailyPlanRepo.Store(h.Ctx, entity.DailyPlan{
		ID:        uuid.New().String(),
		UserId:    h.Session.UID,
		Day:       body.Day,
		Name:      body.Name,
		Breakfast: body.Breakfast,
		Lunch:     body.Lunch,
		Dinner:    body.Dinner,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// dailyPlanHandler.handlePut godoc
// @Summary      Update a daily plan
// @Description  Update a daily plan
// @Param        dailyPlanId path string true "dailyPlanId"
// @Tags         Daily Plan
// @Produce      json
// @Param 		 request body dailyPlanStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /dailyPlan/{dailyPlanId} [put]
// @Security 	 BearerAuth
func (h *dailyPlanHandler) handlePut(dailyPlanId string, body dailyPlanStoreRequest) APIResponse {
	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	err := dailyPlanRepo.Store(h.Ctx, entity.DailyPlan{
		ID:        dailyPlanId,
		UserId:    h.Session.UID,
		Day:       body.Day,
		Name:      body.Name,
		Breakfast: body.Breakfast,
		Lunch:     body.Lunch,
		Dinner:    body.Dinner,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// dailyPlanHandler.handleDelete godoc
// @Summary      Delete a daily plan
// @Description  Delete a daily plan
// @Param        dailyPlanId path string true "dailyPlanId"
// @Tags         Daily Plan
// @Produce      json
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /dailyPlan/{dailyPlanId} [delete]
// @Security 	 BearerAuth
func (h *dailyPlanHandler) handleDelete(dailyPlanId string) APIResponse {
	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	err := dailyPlanRepo.Delete(h.Ctx, dailyPlanId)

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}
