package api

import (
	"encoding/json"
	"fmt"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type recipeHandler struct {
	API
}

type recipeSearchResponse struct {
	Recipes []entity.Recipe `json:"recipes"`
	Total   int             `json:"total"`
}

type recipeStoreRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageUrl    string `json:"imageUrl"`

	Ingredients  []string `json:"ingredients"`
	Instructions []string `json:"instructions"`

	PreparationTime string `json:"preparationTime"`
	CookingTime     string `json:"cookingTime"`
	AllTile         string `json:"allTime"`
	Portions        string `json:"portions"`

	Notes string `json:"notes"`
}

func RespondRecipes(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&recipeHandler{}, writer, request, true)
}

func (h *recipeHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	recipeIdParam := "recipeId"
	switch request.Method {

	case http.MethodGet:
		vars := mux.Vars(request)
		recipeId, exists := vars[recipeIdParam]
		if exists {
			return h.handleGetSpecific(recipeId)
		}

		return h.handleSearch(request)
	case http.MethodPost:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		return h.handlePost(*body)
	case http.MethodPut:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		vars := mux.Vars(request)
		recipeId, exists := vars[recipeIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handlePut(recipeId, *body)
	case http.MethodDelete:
		vars := mux.Vars(request)
		recipeId, exists := vars[recipeIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handleDelete(recipeId)
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

func (h *recipeHandler) handleBody(request *http.Request) (*recipeStoreRequest, error) {
	var body recipeStoreRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	imageUrl := body.ImageUrl
	HTMLSanitizer(&body)
	body.ImageUrl = imageUrl

	if body.Name == "" {
		return nil, fmt.Errorf("name cannot be empty")
	}

	if len(body.Ingredients) == 0 {
		return nil, fmt.Errorf("ingredients cannot be empty")
	}

	if len(body.Instructions) == 0 {
		return nil, fmt.Errorf("instructions cannot be empty")
	}

	return &body, nil
}

// recipeHandler.handleSearch godoc
// @Summary      Search for recipes
// @Description  Search for recipes
// @Tags         Recipes
// @Produce      json
// @Success      200  {object}  recipeSearchResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /recipe [get]
// @Security 	 BearerAuth
func (h *recipeHandler) handleSearch(request *http.Request) APIResponse {
	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	search := GetParameterFromRequest(request, "search")
	limitParam := GetParameterFromRequest(request, "limit")
	offsetParam := GetParameterFromRequest(request, "offset")

	limit := 20
	offset := 0

	if limitParam != "" {
		limit, err = strconv.Atoi(limitParam)
		if err != nil {
			return DefaultBadRequestError()
		}
	}

	if offsetParam != "" {
		offset, err = strconv.Atoi(offsetParam)
		if err != nil {
			return DefaultBadRequestError()
		}
	}

	recipes, total, err := recipeRepo.Search(h.Ctx, clientUser.ElasticIndex, &limit, &offset, &search)
	if err != nil {
		return DefaultInternalServerError()
	}

	response := recipeSearchResponse{
		Recipes: recipes,
		Total:   total,
	}

	json, _ := json.Marshal(response)
	return OKContentType(json, ContentTypeJSON)
}

// recipeHandler.handleGetSpecific godoc
// @Summary      Get specific recipe
// @Description  Get specific recipe
// @Param        recipeId path string true "recipeId"
// @Tags         Recipes
// @Produce      json
// @Success      200  {object}  entity.Recipe
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /recipe/{recipeId} [get]
// @Security 	 BearerAuth
func (h *recipeHandler) handleGetSpecific(recipeId string) APIResponse {
	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	recipe, err := recipeRepo.GetSpecific(h.Ctx, clientUser.ElasticIndex, recipeId)
	if err != nil {
		return DefaultInternalServerError()
	}

	if recipe == nil {
		return DefaultNotFoundError()
	}

	json, _ := json.Marshal(recipe)
	return OKContentType(json, ContentTypeJSON)
}

// recipeHandler.handlePost godoc
// @Summary      Create recipes
// @Description  Create recipes
// @Tags         Recipes
// @Produce      json
// @Param 		 request body recipeStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /recipe [post]
// @Security 	 BearerAuth
func (h *recipeHandler) handlePost(body recipeStoreRequest) APIResponse {
	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	err = recipeRepo.Insert(h.Ctx, clientUser.ElasticIndex, entity.Recipe{
		ID:              "",
		Name:            body.Name,
		Description:     body.Description,
		ImageUrl:        body.ImageUrl,
		Ingredients:     body.Ingredients,
		Instructions:    body.Instructions,
		Tags:            []string{},
		PreparationTime: body.PreparationTime,
		CookingTime:     body.CookingTime,
		AllTile:         body.AllTile,
		Portions:        body.Portions,
		Notes:           body.Notes,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// recipeHandler.handlePut godoc
// @Summary      Update recipes
// @Description  Update recipes
// @Param        recipeId path string true "recipeId"
// @Tags         Recipes
// @Produce      json
// @Param 		 request body recipeStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /recipe/{recipeId} [put]
// @Security 	 BearerAuth
func (h *recipeHandler) handlePut(recipeId string, body recipeStoreRequest) APIResponse {
	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	err = recipeRepo.Update(h.Ctx, clientUser.ElasticIndex, recipeId, entity.Recipe{
		ID:              recipeId,
		Name:            body.Name,
		Description:     body.Description,
		ImageUrl:        body.ImageUrl,
		Ingredients:     body.Ingredients,
		Instructions:    body.Instructions,
		Tags:            []string{},
		PreparationTime: body.PreparationTime,
		CookingTime:     body.CookingTime,
		AllTile:         body.AllTile,
		Portions:        body.Portions,
		Notes:           body.Notes,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// recipeHandler.handleDelete godoc
// @Summary      Delete recipes
// @Description  Delete recipes
// @Param        recipeId path string true "recipeId"
// @Tags         Recipes
// @Produce      json
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /recipe/{recipeId} [delete]
// @Security 	 BearerAuth
func (h *recipeHandler) handleDelete(recipeId string) APIResponse {
	recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	err = recipeRepo.Delete(h.Ctx, clientUser.ElasticIndex, recipeId)
	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}
