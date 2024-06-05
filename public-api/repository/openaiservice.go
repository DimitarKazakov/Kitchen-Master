package repository

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"kitchenmaster/entity"
	"net/http"
	"time"
)

type OpenAIIFace interface {
	CallChatCompletion(request entity.ChatCompletionRequest) (*entity.ChatCompletionResponse, error)

	CallDalleV2(dalleRequest entity.DalleRequest) (*entity.DalleResponse, error)

	CallDalleV3(dalleRequest entity.DalleRequest) (*entity.DalleResponse, error)
}

type OpenAIRepo struct {
	OpenAIIFace

	secretKey          string
	chatCompletionUrl  string
	imageGenerationUrl string
}

func (oar *OpenAIRepo) CallChatCompletion(openAiRequest entity.ChatCompletionRequest) (*entity.ChatCompletionResponse, error) {
	jsonBody, _ := json.Marshal(openAiRequest)

	request, err := http.NewRequest(http.MethodPost, oar.chatCompletionUrl, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+oar.secretKey)
	client := http.Client{
		Timeout: 5 * time.Minute,
	}

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var data entity.ChatCompletionResponse
	err = json.Unmarshal(responseBody, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (oar *OpenAIRepo) CallDalleV2(dalleRequest entity.DalleRequest) (*entity.DalleResponse, error) {
	jsonBody, _ := json.Marshal(dalleRequest)

	request, err := http.NewRequest(http.MethodPost, oar.imageGenerationUrl, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+oar.secretKey)
	client := http.Client{
		Timeout: 5 * time.Minute,
	}

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var data entity.DalleResponse
	err = json.Unmarshal(responseBody, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (oar *OpenAIRepo) CallDalleV3(dalleRequest entity.DalleRequest) (*entity.DalleResponse, error) {
	jsonBody, _ := json.Marshal(dalleRequest)

	request, err := http.NewRequest(http.MethodPost, oar.imageGenerationUrl, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+oar.secretKey)
	client := http.Client{
		Timeout: 5 * time.Minute,
	}

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var data entity.DalleResponse
	err = json.Unmarshal(responseBody, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}
