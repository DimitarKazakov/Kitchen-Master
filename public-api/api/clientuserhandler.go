package api

import (
	"encoding/json"
	"fmt"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type clientUserHandler struct {
	API
}

type clientUserUpdateRequest struct {
	Username          string   `firestore:"username" json:"username"`
	AutoImportEnabled bool     `firestore:"autoImportEnabled" json:"autoImportEnabled"`
	FavoriteRecipeIDs []string `firestore:"favoriteRecipeIDs" json:"favoriteRecipeIDs"`
	Height            int      `firestore:"height" json:"height"`
	Weight            int      `firestore:"weight" json:"weight"`
	Protein           float64  `firestore:"protein" json:"protein"`
	Carbohydrates     float64  `firestore:"carbohydrates" json:"carbohydrates"`
	Fats              float64  `firestore:"fats" json:"fats"`
	Calories          float64  `firestore:"calories" json:"calories"`
	Allergies         []string `firestore:"allergies" json:"allergies"`
}

func RespondClientUser(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&clientUserHandler{}, writer, request, true)
}

func (h *clientUserHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	switch request.Method {

	case http.MethodGet:
		return h.handleGet()
	case http.MethodPut:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		return h.handlePut(*body)
	case http.MethodDelete:
		return h.handleDelete()
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

// clientUserHandler.handleGet godoc
// @Summary      Get client user info
// @Description  Get client user info
// @Tags         ClientUser
// @Produce      json
// @Success      200  {object}  entity.ClientUser
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /clientuser [get]
// @Security 	 BearerAuth
func (h *clientUserHandler) handleGet() APIResponse {
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)

	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	if clientUser == nil {
		recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
		indexName := recipeRepo.GetIndexName(strings.ToLower(uuid.New().String()))
		err = recipeRepo.CreateIndex(indexName)
		if err != nil {
			return DefaultInternalServerError()
		}

		clientUser = &entity.ClientUser{
			ID:                h.Session.UID,
			Username:          h.Session.Claims["email"].(string),
			Email:             h.Session.Claims["email"].(string),
			ElasticIndex:      indexName,
			ImportedRecipes:   []string{},
			AutoImportEnabled: false,
			Subscription:      "FREE",
			FavoriteRecipeIDs: []string{},
			Allergies:         []string{},
			Height:            0,
			Weight:            0,
			Calories:          0,
			Carbohydrates:     0,
			Protein:           0,
			Fats:              0,
			Billing:           0,
		}

		err := clientUserRepo.Store(h.Ctx, *clientUser)
		if err != nil {
			return DefaultInternalServerError()
		}
	}

	json, _ := json.Marshal(clientUser)
	return OKContentType(json, ContentTypeJSON)
}

// clientUserHandler.handleDelete godoc
// @Summary      Delete all client user data
// @Description  Delete all client user data
// @Tags         ClientUser
// @Produce      json
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /clientuser [delete]
// @Security 	 BearerAuth
func (h *clientUserHandler) handleDelete() APIResponse {
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)

	menuRepo := repository.NewMenuRepository(*h.Firestore)
	allMenus, err := menuRepo.GetAllForUser(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	for _, menu := range allMenus {
		err := menuRepo.Delete(h.Ctx, menu.ID)
		if err != nil {
			return DefaultInternalServerError()
		}
	}

	dailyPlanRepo := repository.NewDailyPlanRepository(*h.Firestore)
	allPlans, err := dailyPlanRepo.GetAllForUser(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	for _, plan := range allPlans {
		err := dailyPlanRepo.Delete(h.Ctx, plan.ID)
		if err != nil {
			return DefaultInternalServerError()
		}
	}

	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	err = recipeRepo.DeleteIndex(clientUser.ElasticIndex)
	if err != nil {
		return DefaultInternalServerError()
	}

	err = clientUserRepo.Delete(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

func (h *clientUserHandler) handleBody(request *http.Request) (*clientUserUpdateRequest, error) {
	var body clientUserUpdateRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.Username == "" {
		return nil, fmt.Errorf("username cannot be empty")
	}

	return &body, nil
}

// clientUserHandler.handlePut godoc
// @Summary      Update client user info
// @Description  Update client user info
// @Tags         ClientUser
// @Produce      json
// @Param 		 request body clientUserUpdateRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /clientuser [put]
// @Security 	 BearerAuth
func (h *clientUserHandler) handlePut(body clientUserUpdateRequest) APIResponse {
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	entity, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	entity.Username = body.Username
	entity.Allergies = body.Allergies
	entity.AutoImportEnabled = body.AutoImportEnabled
	entity.FavoriteRecipeIDs = body.FavoriteRecipeIDs
	entity.Height = body.Height
	entity.Weight = body.Weight
	entity.Calories = body.Calories
	entity.Fats = body.Fats
	entity.Protein = body.Protein
	entity.Carbohydrates = body.Carbohydrates

	err = clientUserRepo.Store(h.Ctx, *entity)
	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}
