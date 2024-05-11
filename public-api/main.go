package main

import (
	"kitchenmaster/api"
	"kitchenmaster/scheduler"
	"net/http"

	_ "kitchenmaster/docs"

	"github.com/common-nighthawk/go-figure"
	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title                      API
// @version                    1.0
// @description                Kitchen Master API
// @host                       localhost:8080
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @BasePath                   /
func main() {
	bannerFigure := figure.NewFigure("Kitchen Master API", "", true)
	bannerFigure.Print()

	go scheduler.RunScheduler()

	router := mux.NewRouter().StrictSlash(true)

	router.HandleFunc("/health", getHealth())

	router.HandleFunc("/clientuser", api.RespondClientUser)
	router.HandleFunc("/message", api.RespondMessage)

	router.HandleFunc("/recipe", api.RespondRecipes)
	router.HandleFunc("/recipe/{recipeId}", api.RespondRecipes)

	router.HandleFunc("/menu", api.RespondMenu)
	router.HandleFunc("/menu/{menuId}", api.RespondMenu)

	router.HandleFunc("/dailyPlan", api.RespondDailyPlan)
	router.HandleFunc("/dailyPlan/{dailyPlanId}", api.RespondDailyPlan)

	router.HandleFunc("/generate/{entity}", api.RespondGenerate)

	// setting up the swagger UI
	router.PathPrefix("/swagger").Handler(httpSwagger.WrapHandler)

	server := &http.Server{Addr: "127.0.0.1:8080", Handler: router}
	server.ListenAndServe()
}

func getHealth() func(writer http.ResponseWriter, request *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		statusCode := http.StatusOK
		writer.WriteHeader(statusCode)
		writer.Write([]byte("{status:UP}"))
	}
}
