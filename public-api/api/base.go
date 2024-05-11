package api

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"os"
	"strings"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/elastic/go-elasticsearch/v8"
	"google.golang.org/api/option"
)

type AuthenticateAndInitialiseHandler func(api *API, request *http.Request) error

type Config struct {
	ElasticUsername string
	ElasticPassword string
	ElasticURL      string
	ElasticApiKey   string
	OpenAISecretKey string
	OpenAIChatURL   string
	OpenAIImageURL  string
}

type API struct {
	APIInterface

	AuthClient          *auth.Client
	Firestore           *firestore.Client
	ElasticSearchClient *elasticsearch.Client
	Session             *auth.Token
	Ctx                 context.Context
	Config              Config
}

type APIInterface interface {
	InitialiseServices() error
	Respond(request *http.Request) APIResponse
	Authenticate(request *http.Request) error
	SetupConfig() error
}

// HandleAPIResponse takes the handler, bootstraps it and then responds
func handleAPIResponse(handler APIInterface, writer http.ResponseWriter, request *http.Request, authenticatedRequest bool) {
	var err error = nil

	err = handler.SetupConfig()
	if err != nil {
		response := DefaultInternalServerError()

		writer.WriteHeader(response.Status)
		writer.Write(response.Content)
		return
	}

	err = handler.InitialiseServices()
	if err != nil {
		response := DefaultInternalServerError()

		writer.WriteHeader(response.Status)
		writer.Write(response.Content)
		return
	}

	if authenticatedRequest {
		err = handler.Authenticate(request)
		if err != nil {
			response := DefaultUnauthorized()

			writer.WriteHeader(response.Status)
			writer.Write(response.Content)
			return
		}
	}

	response := handler.Respond(request)
	if response.ContentType != nil {
		writer.Header().Set("Content-Type", *response.ContentType)
	}

	writer.WriteHeader(response.Status)
	writer.Write(response.Content)
}

func (api *API) SetupConfig() error {
	config := Config{}
	config.ElasticUsername = os.Getenv("ELASTIC_USERNAME")
	config.ElasticPassword = os.Getenv("ELASTIC_PASSWORD")
	config.ElasticApiKey = os.Getenv("ELASTIC_API_KEY")
	config.ElasticURL = os.Getenv("ELASTIC_URL")
	config.OpenAIChatURL = os.Getenv("OPENAI_CHAT_URL")
	config.OpenAISecretKey = os.Getenv("OPENAI_SECRET_KEY")
	config.OpenAIImageURL = os.Getenv("OPENAI_IMAGE_URL")

	if config.ElasticApiKey == "" ||
		config.ElasticPassword == "" ||
		config.ElasticURL == "" ||
		config.ElasticUsername == "" ||
		config.OpenAIChatURL == "" ||
		config.OpenAISecretKey == "" {

		return fmt.Errorf("missing env variables")
	}

	api.Config = config
	return nil
}

func (api *API) InitialiseServices() error {
	api.Ctx = context.Background()

	firebase, err := ConnectFirebaseApp(api.Ctx)
	if err != nil {
		return err
	}

	authClient, err := firebase.Auth(api.Ctx)
	if err != nil {
		return err
	}

	firestore, err := firebase.Firestore(api.Ctx)
	if err != nil {
		return err
	}

	config := elasticsearch.Config{
		Addresses: []string{
			api.Config.ElasticURL,
		},
		APIKey: api.Config.ElasticApiKey,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Username: api.Config.ElasticUsername,
		Password: api.Config.ElasticPassword,
	}

	elasticSearchClient, err := elasticsearch.NewClient(config)
	if err != nil {
		return err
	}

	api.AuthClient = authClient
	api.Firestore = firestore
	api.ElasticSearchClient = elasticSearchClient

	return nil
}

func (api *API) Authenticate(request *http.Request) error {
	reqToken := request.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer ")
	if len(splitToken) == 1 {
		return fmt.Errorf("no auth token error")
	}

	reqToken = splitToken[1]
	token, err := api.AuthClient.VerifyIDToken(api.Ctx, reqToken)
	if err != nil {
		return err
	}

	api.Session = token
	return nil
}

func ConnectFirebaseApp(ctx context.Context) (*firebase.App, error) {
	opt := option.WithCredentialsFile("./firebaseCredentials.json")
	return firebase.NewApp(ctx, nil, opt)
}
