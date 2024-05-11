package api

import (
	"encoding/json"
	"fmt"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

var (
	DEFAULT_IMAGE = "https://tracksideflex.cdnflexcatering.com/themes/frontend/default/images/img-placeholder.png"
)

type generateHandler struct {
	API
}

type generateIntakeRequest struct {
	Height        int `json:"height"`
	CurrentWeight int `json:"currentWeight"`
	DesiredWeight int `json:"desiredWeight"`
}

type generateIntakeResponse struct {
	Program generateIntakeProgram `json:"program"`
}

type generateIntakeProgram struct {
	Protein       float64 `json:"protein"`
	Carbohydrates float64 `json:"carbohydrates"`
	Fats          float64 `json:"fats"`
	Calories      float64 `json:"calories"`
}

type generateMenuRequest struct {
	Event            string   `json:"event"`
	NumberOfPeople   int      `json:"numberOfPeople"`
	NumberOfCourses  int      `json:"numberOfCourses"`
	IncludeDrinks    bool     `json:"includeDrinks"`
	IncludeCocktails bool     `json:"includeCocktails"`
	Exclude          []string `json:"exclude"`
	ExcludeDessert   bool     `json:"excludeDessert"`
}

type generateMenuResponse struct {
	Menu []generatedRecipe `json:"menu"`
}

type generatedRecipe struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageUrl    string `json:"imageUrl"`

	Ingredients  []string `json:"ingredients"`
	Instructions []string `json:"instructions"`

	PreparationTime string `json:"preparationTime"`
	CookingTime     string `json:"cookingTime"`
	AllTime         string `json:"allTime"`
	Portions        string `json:"portions"`
}

type generateDailyPlanRequest struct {
	Protein       float64 `json:"protein"`
	Carbohydrates float64 `json:"carbohydrates"`
	Fats          float64 `json:"fats"`
	Calories      float64 `json:"calories"`

	IncludeBreakfast bool `json:"includeBreakfast"`
	IncludeLunch     bool `json:"includeLunch"`
	IncludeDinner    bool `json:"includeDinner"`
}

type generateDailyPlanResponse struct {
	Breakfast *generatedRecipe `json:"breakfast,omitempty" validate:"optional"`
	Lunch     *generatedRecipe `json:"lunch,omitempty" validate:"optional"`
	Dinner    *generatedRecipe `json:"dinner,omitempty" validate:"optional"`
}

type generateRecipeRequest struct {
	Include []string `json:"include"`
	Exclude []string `json:"exclude"`
}

type generateImageRequest struct {
	RecipeName string `json:"recipeName"`
}

type generateImageResponse struct {
	ImageUrl string `json:"imageUrl"`
}

type generateTranslationResponse struct {
	Text string `json:"text"`
}

type generateCustomEntityRequest struct {
	UserInput string `json:"userInput"`
}

func RespondGenerate(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&generateHandler{}, writer, request, true)
}

func (h *generateHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	entityParam := "entity"
	vars := mux.Vars(request)
	entity := vars[entityParam]

	clientUserRepo := repository.NewClientUserRepository(*h.Firestore, *h.AuthClient)
	clientUser, err := clientUserRepo.GetSpecific(h.Ctx, h.Session.UID)
	if err != nil {
		return DefaultInternalServerError()
	}

	// NOTE: users with FREE subscription cannot generate stuff
	if clientUser.Subscription == "FREE" {
		return DefaultUnauthorized()
	}

	switch request.Method {

	case http.MethodPost:
		if entity == "recipe" {
			body, err := h.handleRecipeBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateRecipe(request, *body)
		}

		if entity == "dailyintake" {
			body, err := h.handleIntakeBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateDailyIntake(*body)
		}

		if entity == "dailyplan" {
			body, err := h.handleDailyPlanBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateDailyPlan(request, *body)
		}

		if entity == "menu" {
			body, err := h.handleMenuBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateMenu(request, *body)
		}

		if entity == "image" {
			body, err := h.handleGenerateRecipeImageBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateRecipeImage(*body)
		}

		if entity == "customrecipe" {
			body, err := h.handleCustomEntityBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateCustomRecipe(request, *body)
		}

		if entity == "custommenu" {
			body, err := h.handleCustomEntityBody(request)
			if err != nil {
				return DefaultBadRequestError()
			}

			return h.handleGenerateCustomMenu(request, *body)
		}

		return DefaultNotFoundError()
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

func (h *generateHandler) handleRecipeBody(request *http.Request) (*generateRecipeRequest, error) {
	var body generateRecipeRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	return &body, nil
}

// generateHandler.handleGenerateRecipe godoc
// @Summary      Generate a recipe
// @Description  Generate a recipe
// @Tags         Generate
// @Param        generateImage query string true "generateImage"
// @Produce      json
// @Param 		 request body generateRecipeRequest true "body"
// @Success      200  {object}  generatedRecipe
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/recipe [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateRecipe(request *http.Request, body generateRecipeRequest) APIResponse {
	generateImage := GetParameterFromRequest(request, "generateImage")
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	prompt := "Give me a recipe in JSON format {\"name\": string, \"description\": string, \"preparationTime\": string, \"cookingTime\": string, \"allTime\": string, \"portions\": string, \"ingredients\": string[], \"instructions\": string[]}. Translate the values in Bulgarian."
	if len(body.Include) > 0 {
		prompt += fmt.Sprintf("Include some of those ingredients %s ." + strings.Join(body.Include, ", "))
	}

	if len(body.Exclude) > 0 {
		prompt += fmt.Sprintf("Strictly do not include %s ." + strings.Join(body.Exclude, ", "))
	}

	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a cooking recipe assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatRecipe := generatedRecipe{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatRecipe)
	if err != nil {
		return DefaultInternalServerError()
	}

	if generateImage == "true" {
		translatedName, err := h.translateToEnglish(chatRecipe.Name)
		if err != nil {
			return DefaultInternalServerError()
		}

		generatedImg := h.generateImage(*translatedName)
		chatRecipe.ImageUrl = generatedImg
	} else {
		chatRecipe.ImageUrl = DEFAULT_IMAGE
	}

	json, _ := json.Marshal(chatRecipe)
	return OKContentType(json, ContentTypeJSON)
}

func (h *generateHandler) handleIntakeBody(request *http.Request) (*generateIntakeRequest, error) {
	var body generateIntakeRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.CurrentWeight <= 0 {
		return nil, fmt.Errorf("current weight must be positive")
	}

	if body.DesiredWeight <= 0 {
		return nil, fmt.Errorf("desired weight must be positive")
	}

	if body.Height <= 0 {
		return nil, fmt.Errorf("height must be positive")
	}

	return &body, nil
}

// generateHandler.handleGenerateDailyIntake godoc
// @Summary      Generate a daily intake
// @Description  Generate a daily intake
// @Tags         Generate
// @Produce      json
// @Param 		 request body generateIntakeRequest true "body"
// @Success      200  {object}  generateIntakeResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/dailyintake [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateDailyIntake(body generateIntakeRequest) APIResponse {
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	// NOTE: here we use few shot learning to fine tune the diets we want to give to users
	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a diet assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: "Give me a diet program to achieve my desired weight. I am 175cm tall and weight 95kg. I want to become 75kg. Give me daily protein, fats, carbohydrates, and calorie intake. Give the response in JSON format {\"program\": {\"protein\": number,\"carbohydrates\": number, \"fats\": number, \"calories\": number}}",
			},
			{
				Role:    "assistant",
				Content: "{\"program\": {\"protein\": 120,\"carbohydrates\": 150,\"fats\": 50,\"calories\": 1700}}",
			},
			{
				Role:    "user",
				Content: "Give me a diet program to achieve my desired weight. I am 200cm tall and weight 130kg. I want to become 95kg. Give me daily protein, fats, carbohydrates, and calorie intake. Give the response in JSON format {\"program\": {\"protein\": number,\"carbohydrates\": number, \"fats\": number, \"calories\": number}}",
			},
			{
				Role:    "assistant",
				Content: "{\"program\": {\"protein\": 150,\"carbohydrates\": 180,\"fats\": 60,\"calories\": 2000}}",
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Give me a diet program to achieve my desired weight. I am %dcm tall and weight %dkg. I want to become %dkg. Give me daily protein, fats, carbohydrates, and calorie intake. Give the response in JSON format {\"program\": {\"protein\": number,\"carbohydrates\": number, \"fats\": number, \"calories\": number}}", body.Height, body.CurrentWeight, body.DesiredWeight),
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatDiet := generateIntakeResponse{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatDiet)
	if err != nil {
		return DefaultInternalServerError()
	}

	json, _ := json.Marshal(chatDiet)
	return OKContentType(json, ContentTypeJSON)
}

func (h *generateHandler) handleDailyPlanBody(request *http.Request) (*generateDailyPlanRequest, error) {
	var body generateDailyPlanRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.Protein <= 0 {
		return nil, fmt.Errorf("protein must be positive")
	}

	if body.Calories <= 0 {
		return nil, fmt.Errorf("calories must be positive")
	}

	if body.Carbohydrates <= 0 {
		return nil, fmt.Errorf("carbohydrates must be positive")
	}

	if body.Fats <= 0 {
		return nil, fmt.Errorf("fats must be positive")
	}

	if !body.IncludeBreakfast && !body.IncludeLunch && !body.IncludeDinner {
		return nil, fmt.Errorf("you should include at least one meal")
	}

	return &body, nil
}

// generateHandler.handleGenerateDailyPlan godoc
// @Summary      Generate a daily plan
// @Description  Generate a daily plan
// @Tags         Generate
// @Param        generateImage query string true "generateImage"
// @Produce      json
// @Param 		 request body generateDailyPlanRequest true "body"
// @Success      200  {object}  generateDailyPlanResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/dailyplan [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateDailyPlan(request *http.Request, body generateDailyPlanRequest) APIResponse {
	generateImage := GetParameterFromRequest(request, "generateImage")
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	includedMeals := ""
	excludeMeals := ""
	jsonResponseStructure := "{"
	if body.IncludeBreakfast {
		includedMeals += "breakfast, "
		jsonResponseStructure += "\"breakfast\": RecipeStructureJSON{},"
	} else {
		excludeMeals += "breakfast, "
	}

	if body.IncludeLunch {
		includedMeals += "lunch, "
		jsonResponseStructure += "\"lunch\": RecipeStructureJSON{},"
	} else {
		excludeMeals += "lunch, "
	}

	if body.IncludeDinner {
		includedMeals += "dinner."
		jsonResponseStructure += "\"dinner\": RecipeStructureJSON{}"
	} else {
		excludeMeals += "dinner."
	}

	if includedMeals == "" {
		return DefaultBadRequestError()
	}

	jsonResponseStructure += "}"

	prompt := fmt.Sprintf("Give me a daily meal plan including %s, and include the recipes for the meals. My daily intake is %f calories, %fg carbohydrates, %fg protein and %fg fats. Give the response in the JSON format %s. The JSON format for the RecipeStructureJSON is {\"name\": string, \"description\": string, \"preparationTime\": string, \"cookingTime\": string, \"allTime\": string, \"portions\": string, \"ingredients\": string[], \"instructions\": string[]}. Translate the values in Bulgarian.", includedMeals, body.Calories, body.Carbohydrates, body.Protein, body.Fats, jsonResponseStructure)
	if excludeMeals != "" {
		prompt += "Exclude " + excludeMeals
	}

	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a cooking recipe assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatDailyPlan := generateDailyPlanResponse{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatDailyPlan)
	if err != nil {
		return DefaultInternalServerError()
	}

	if chatDailyPlan.Breakfast != nil {
		if generateImage == "true" {
			translatedName, err := h.translateToEnglish(chatDailyPlan.Breakfast.Name)
			if err != nil {
				return DefaultInternalServerError()
			}

			generatedImg := h.generateImage(*translatedName)
			chatDailyPlan.Breakfast.ImageUrl = generatedImg
		} else {
			chatDailyPlan.Breakfast.ImageUrl = DEFAULT_IMAGE
		}
	}

	if chatDailyPlan.Lunch != nil {
		if generateImage == "true" {
			translatedName, err := h.translateToEnglish(chatDailyPlan.Lunch.Name)
			if err != nil {
				return DefaultInternalServerError()
			}

			generatedImg := h.generateImage(*translatedName)
			chatDailyPlan.Lunch.ImageUrl = generatedImg
		} else {
			chatDailyPlan.Lunch.ImageUrl = DEFAULT_IMAGE
		}
	}

	if chatDailyPlan.Dinner != nil {
		if generateImage == "true" {
			translatedName, err := h.translateToEnglish(chatDailyPlan.Dinner.Name)
			if err != nil {
				return DefaultInternalServerError()
			}

			generatedImg := h.generateImage(*translatedName)
			chatDailyPlan.Dinner.ImageUrl = generatedImg
		} else {
			chatDailyPlan.Dinner.ImageUrl = DEFAULT_IMAGE
		}
	}

	json, _ := json.Marshal(chatDailyPlan)
	return OKContentType(json, ContentTypeJSON)
}

func (h *generateHandler) handleMenuBody(request *http.Request) (*generateMenuRequest, error) {
	var body generateMenuRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.Event == "" {
		return nil, fmt.Errorf("event cannot be empty")
	}

	if body.NumberOfCourses <= 0 {
		return nil, fmt.Errorf("number of courses should be positive")
	}

	if body.NumberOfPeople <= 0 {
		return nil, fmt.Errorf("number of people should be positive")
	}

	return &body, nil
}

// generateHandler.handleGenerateMenu godoc
// @Summary      Generate a menu
// @Description  Generate a menu
// @Tags         Generate
// @Param        generateImage query string true "generateImage"
// @Produce      json
// @Param 		 request body generateMenuRequest true "body"
// @Success      200  {object}  generateMenuResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/menu [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateMenu(request *http.Request, body generateMenuRequest) APIResponse {
	generateImage := GetParameterFromRequest(request, "generateImage")
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	prompt := fmt.Sprintf("Give me a %d-course menu for a %s for %d people with recipes in JSON format {\"menu\": {\"name\": string, \"description\": string, \"preparationTime\": string, \"cookingTime\": string, \"allTime\": string, \"portions\": string, \"ingredients\": string[], \"instructions\": string[]}[]}. Translate the values in Bulgarian.", body.NumberOfCourses, body.Event, body.NumberOfPeople)
	if body.IncludeDrinks {
		prompt += "Include drinks as well."
	}

	if body.IncludeCocktails {
		prompt += "Include cocktails as well."
	}

	if body.ExcludeDessert {
		prompt += "Don't include dessert in the menu."
	}

	if len(body.Exclude) > 0 {
		prompt += fmt.Sprintf("Don't include %s ." + strings.Join(body.Exclude, ", "))
	}

	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a cooking recipe assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatMenu := generateMenuResponse{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatMenu)
	if err != nil {
		return DefaultInternalServerError()
	}

	newMenu := []generatedRecipe{}
	for _, menuRecipe := range chatMenu.Menu {
		if generateImage == "true" {
			translatedName, err := h.translateToEnglish(menuRecipe.Name)
			if err != nil {
				return DefaultInternalServerError()
			}

			generatedImg := h.generateImage(*translatedName)
			menuRecipe.ImageUrl = generatedImg
		} else {
			menuRecipe.ImageUrl = DEFAULT_IMAGE
		}

		newMenu = append(newMenu, menuRecipe)
	}
	chatMenu.Menu = newMenu

	json, _ := json.Marshal(chatMenu)
	return OKContentType(json, ContentTypeJSON)
}

func (h *generateHandler) handleGenerateRecipeImageBody(request *http.Request) (*generateImageRequest, error) {
	var body generateImageRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.RecipeName == "" {
		return nil, fmt.Errorf("recipe name cannot be empty")
	}

	return &body, nil
}

// generateHandler.handleGenerateRecipeImage godoc
// @Summary      Generate a recipe image
// @Description  Generate a recipe image
// @Tags         Generate
// @Produce      json
// @Param 		 request body generateImageRequest true "body"
// @Success      200  {object}  generateImageResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/image [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateRecipeImage(body generateImageRequest) APIResponse {
	imageUrl := h.generateImage(body.RecipeName)
	image := generateImageResponse{
		ImageUrl: imageUrl,
	}

	json, _ := json.Marshal(image)
	return OKContentType(json, ContentTypeJSON)
}

func (h *generateHandler) generateImage(recipeName string) string {
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	imageRequest := entity.DalleRequest{
		Model:  "dall-e-2",
		Prompt: "Give me an image for this cooking recipe: " + recipeName,
		N:      1,
		Size:   "1024x1024",
	}

	imageResponse, err := openAIRepo.CallDalleV2(imageRequest)
	if err != nil {
		return DEFAULT_IMAGE
	}

	return imageResponse.Data[0].URL
}

func (h *generateHandler) translateToEnglish(text string) (*string, error) {
	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are an English translator designed to output JSON",
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Give me the English translation for this Bulgarian sentence:  '%s'. Return the response in JSON format {text:string}", text),
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return nil, err
	}

	translation := generateTranslationResponse{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &translation)
	if err != nil {
		return nil, err
	}

	return &translation.Text, nil
}

func (h *generateHandler) handleCustomEntityBody(request *http.Request) (*generateCustomEntityRequest, error) {
	var body generateCustomEntityRequest

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.UserInput == "" {
		return nil, fmt.Errorf("user input cannot be empty")
	}

	return &body, nil
}

// generateHandler.handleGenerateCustomRecipe godoc
// @Summary      Generate a custom recipe
// @Description  Generate a custom recipe
// @Tags         Generate
// @Param        generateImage query string true "generateImage"
// @Produce      json
// @Param 		 request body generateCustomEntityRequest true "body"
// @Success      200  {object}  generatedRecipe
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/customrecipe [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateCustomRecipe(request *http.Request, body generateCustomEntityRequest) APIResponse {
	generateImage := GetParameterFromRequest(request, "generateImage")
	translatedInput, err := h.translateToEnglish(body.UserInput)
	if err != nil {
		return DefaultInternalServerError()
	}

	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	prompt := "Give me a recipe in JSON format {\"name\": string, \"description\": string, \"preparationTime\": string, \"cookingTime\": string, \"allTime\": string, \"portions\": string, \"ingredients\": string[], \"instructions\": string[]}. Translate the values in Bulgarian. The instructions for the recipe are those: " + *translatedInput
	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a cooking recipe assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatRecipe := generatedRecipe{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatRecipe)
	if err != nil {
		return DefaultInternalServerError()
	}

	if generateImage == "true" {
		translatedName, err := h.translateToEnglish(chatRecipe.Name)
		if err != nil {
			return DefaultInternalServerError()
		}

		generatedImg := h.generateImage(*translatedName)
		chatRecipe.ImageUrl = generatedImg
	} else {
		chatRecipe.ImageUrl = DEFAULT_IMAGE
	}

	json, _ := json.Marshal(chatRecipe)
	return OKContentType(json, ContentTypeJSON)
}

// generateHandler.handleGenerateCustomMenu godoc
// @Summary      Generate a custom menu
// @Description  Generate a custom menu
// @Tags         Generate
// @Param        generateImage query string true "generateImage"
// @Produce      json
// @Param 		 request body generateCustomEntityRequest true "body"
// @Success      200  {object}  generateMenuResponse
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /generate/custommenu [post]
// @Security 	 BearerAuth
func (h *generateHandler) handleGenerateCustomMenu(request *http.Request, body generateCustomEntityRequest) APIResponse {
	generateImage := GetParameterFromRequest(request, "generateImage")
	translatedInput, err := h.translateToEnglish(body.UserInput)
	if err != nil {
		return DefaultInternalServerError()
	}

	openAIRepo := repository.NewOpenAIRepository(h.Config.OpenAISecretKey, h.Config.OpenAIChatURL, h.Config.OpenAIImageURL)

	prompt := "Give me a menu with recipes in JSON format {\"menu\": {\"name\": string, \"description\": string, \"preparationTime\": string, \"cookingTime\": string, \"allTime\": string, \"portions\": string, \"ingredients\": string[], \"instructions\": string[]}[]}. Translate the values in Bulgarian. The instructions for the menu are those: " + *translatedInput
	chatRequest := entity.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		ResponseFormat: entity.ChatCompletionResponseFormat{
			Type: "json_object",
		},
		Messages: []entity.ChatCompletionMessage{
			{
				Role:    "system",
				Content: "You are a cooking recipe assistant designed to output JSON",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	chatResponse, err := openAIRepo.CallChatCompletion(chatRequest)
	if err != nil {
		return DefaultInternalServerError()
	}

	chatMenu := generateMenuResponse{}
	err = json.Unmarshal([]byte(chatResponse.Choices[0].Message.Content), &chatMenu)
	if err != nil {
		return DefaultInternalServerError()
	}

	newMenu := []generatedRecipe{}
	for _, menuRecipe := range chatMenu.Menu {
		if generateImage == "true" {
			translatedName, err := h.translateToEnglish(menuRecipe.Name)
			if err != nil {
				return DefaultInternalServerError()
			}

			generatedImg := h.generateImage(*translatedName)
			menuRecipe.ImageUrl = generatedImg
		} else {
			menuRecipe.ImageUrl = DEFAULT_IMAGE
		}

		newMenu = append(newMenu, menuRecipe)
	}

	chatMenu.Menu = newMenu

	json, _ := json.Marshal(chatMenu)
	return OKContentType(json, ContentTypeJSON)
}
