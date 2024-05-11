package api

import (
	"encoding/json"
	"fmt"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type menuHandler struct {
	API
}

type menuStoreRequest struct {
	Recipes []entity.Recipe `firestore:"recipes" json:"recipes"`
	Event   string          `firestore:"event" json:"event"`
}

func RespondMenu(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&menuHandler{}, writer, request, true)
}

func (h *menuHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	menuIdParam := "menuId"

	switch request.Method {

	case http.MethodGet:
		vars := mux.Vars(request)
		menuId, exists := vars[menuIdParam]
		if exists {
			return h.handleGetSpecific(menuId)
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
		menuId, exists := vars[menuIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handlePut(menuId, *body)
	case http.MethodDelete:
		vars := mux.Vars(request)
		menuId, exists := vars[menuIdParam]
		if !exists {
			return DefaultBadRequestError()
		}

		return h.handleDelete(menuId)
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

func (h *menuHandler) handleBody(request *http.Request) (*menuStoreRequest, error) {
	var body menuStoreRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if len(body.Recipes) == 0 {
		return nil, fmt.Errorf("cannot create meny with zero recipes")
	}

	return &body, nil
}

// menuHandler.handleGetAll godoc
// @Summary      Get all menus for user
// @Description  Get all menus for user
// @Tags         Menu
// @Produce      json
// @Success      200  {object}  []entity.Menu
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /menu [get]
// @Security 	 BearerAuth
func (h *menuHandler) handleGetAll() APIResponse {
	menuRepo := repository.NewMenuRepository(*h.Firestore)
	menus, err := menuRepo.GetAllForUser(h.Ctx, h.Session.UID)

	if err != nil {
		return DefaultInternalServerError()
	}

	json, _ := json.Marshal(menus)
	return OKContentType(json, ContentTypeJSON)
}

// menuHandler.handleGetSpecific godoc
// @Summary      Get specific menu
// @Description  Get specific menu
// @Param        menuId path string true "menuId"
// @Tags         Menu
// @Produce      json
// @Success      200  {object}  entity.Menu
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /menu/{menuId} [get]
// @Security 	 BearerAuth
func (h *menuHandler) handleGetSpecific(menuId string) APIResponse {
	menuRepo := repository.NewMenuRepository(*h.Firestore)
	menu, err := menuRepo.GetSpecific(h.Ctx, menuId)

	if err != nil {
		return DefaultInternalServerError()
	}

	if menu == nil {
		return DefaultNotFoundError()
	}

	json, _ := json.Marshal(menu)
	return OKContentType(json, ContentTypeJSON)
}

// menuHandler.handlePost godoc
// @Summary      Create a menu
// @Description  Create a menu
// @Param        createRecipes query string true "createRecipes"
// @Tags         Menu
// @Produce      json
// @Param 		 request body menuStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /menu [post]
// @Security 	 BearerAuth
func (h *menuHandler) handlePost(body menuStoreRequest, request *http.Request) APIResponse {
	createRecipesParam := GetParameterFromRequest(request, "createRecipes")
	if createRecipesParam == "true" {
		recipeRepo := repository.NewRecipeRepository(*h.ElasticSearchClient)
		clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
		clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
		if err != nil {
			return DefaultInternalServerError()
		}

		for _, recipe := range body.Recipes {
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

	menuRepo := repository.NewMenuRepository(*h.Firestore)
	err := menuRepo.Store(h.Ctx, entity.Menu{
		ID:      uuid.New().String(),
		UserId:  h.Session.UID,
		Event:   body.Event,
		Recipes: body.Recipes,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// menuHandler.handlePut godoc
// @Summary      Update a menu
// @Description  Update a menu
// @Param        menuId path string true "menuId"
// @Tags         Menu
// @Produce      json
// @Param 		 request body menuStoreRequest true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /menu/{menuId} [put]
// @Security 	 BearerAuth
func (h *menuHandler) handlePut(menuId string, body menuStoreRequest) APIResponse {
	menuRepo := repository.NewMenuRepository(*h.Firestore)
	err := menuRepo.Store(h.Ctx, entity.Menu{
		ID:      menuId,
		UserId:  h.Session.UID,
		Event:   body.Event,
		Recipes: body.Recipes,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}

// menuHandler.handleDelete godoc
// @Summary      Delete a menu
// @Description  Delete a menu
// @Param        menuId path string true "menuId"
// @Tags         Menu
// @Produce      json
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /menu/{menuId} [delete]
// @Security 	 BearerAuth
func (h *menuHandler) handleDelete(menuId string) APIResponse {
	menuRepo := repository.NewMenuRepository(*h.Firestore)
	err := menuRepo.Delete(h.Ctx, menuId)

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}
