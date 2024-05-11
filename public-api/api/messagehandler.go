package api

import (
	"encoding/json"
	"fmt"
	"kitchenmaster/entity"
	"kitchenmaster/repository"
	"net/http"

	"github.com/google/uuid"
)

type messageHandler struct {
	API
}

type messageHandlerPostBody struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func RespondMessage(writer http.ResponseWriter, request *http.Request) {

	handleAPIResponse(&messageHandler{}, writer, request, true)
}

func (h *messageHandler) Respond(request *http.Request) APIResponse {
	defer h.Firestore.Close()

	switch request.Method {

	case http.MethodPost:
		body, err := h.handleBody(request)
		if err != nil {
			return DefaultBadRequestError()
		}

		return h.handlePost(*body)
	default:
		return InternalServerError([]byte("not implemented\n"))
	}
}

func (h *messageHandler) handleBody(request *http.Request) (*messageHandlerPostBody, error) {
	var body messageHandlerPostBody

	err := json.NewDecoder(request.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	HTMLSanitizer(&body)

	if body.Title == "" {
		return nil, fmt.Errorf("title cannot be empty")
	}

	if body.Content == "" {
		return nil, fmt.Errorf("content cannot be empty")
	}

	return &body, nil
}

// messageHandler.handlePost godoc
// @Summary      Create message
// @Description  Create message
// @Tags         Message
// @Produce      json
// @Param 		 request body messageHandlerPostBody true "body"
// @Success      200  {string}  "OK"
// @Failure      400  {object}  APIResponse
// @Failure      401  {object}  APIResponse
// @Failure      500  {object}  APIResponse
// @Router       /message [post]
// @Security 	 BearerAuth
func (h *messageHandler) handlePost(body messageHandlerPostBody) APIResponse {
	messageRepo := repository.NewMessageRepository(*h.Firestore)
	err := messageRepo.Store(h.Ctx, entity.Message{
		ID:      uuid.New().String(),
		Title:   body.Title,
		Content: body.Content,
		UserId:  h.Session.UID,
	})

	if err != nil {
		return DefaultInternalServerError()
	}

	return DefaultOK()
}
