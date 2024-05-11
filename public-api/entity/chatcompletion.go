package entity

type ChatCompletionRequest struct {
	Model            string                       `json:"model,omitempty" validate:"optional"`
	Messages         []ChatCompletionMessage      `json:"messages,omitempty" validate:"optional"`
	Suffix           string                       `json:"suffix,omitempty" validate:"optional"`
	MaxTokens        int                          `json:"max_tokens,omitempty" validate:"optional"`
	Temperature      float64                      `json:"temperature,omitempty" validate:"optional"`
	TopP             float64                      `json:"top_p,omitempty" validate:"optional"`
	N                int                          `json:"n,omitempty" validate:"optional"`
	Stream           bool                         `json:"stream,omitempty" validate:"optional"`
	LogProbs         int                          `json:"logprobs,omitempty" validate:"optional"`
	Echo             bool                         `json:"echo,omitempty" validate:"optional"`
	PresencePenalty  float64                      `json:"presence_penalty,omitempty" validate:"optional"`
	FrequencyPenalty float64                      `json:"frequency_penalty,omitempty" validate:"optional"`
	BestOf           int                          `json:"best_of,omitempty" validate:"optional"`
	LogitBias        map[string]string            `json:"logit_bias,omitempty" validate:"optional"`
	User             string                       `json:"user,omitempty" validate:"optional"`
	ResponseFormat   ChatCompletionResponseFormat `json:"response_format,omitempty" validate:"optional"`
}

type ChatCompletionResponseFormat struct {
	Type string `json:"type"`
}

type ChatCompletionResponse struct {
	ID      string `json:"id,omitempty" validate:"optional"`
	Object  string `json:"object,omitempty" validate:"optional"`
	Created int    `json:"created,omitempty" validate:"optional"`
	Model   string `json:"model,omitempty" validate:"optional"`
	Choices []struct {
		Message struct {
			Role    string `json:"role,omitempty" validate:"optional"`
			Content string `json:"content,omitempty" validate:"optional"`
		} `json:"message"`
		Text         string      `json:"text,omitempty" validate:"optional"`
		Index        int         `json:"index,omitempty" validate:"optional"`
		Logprobs     interface{} `json:"logprobs,omitempty" validate:"optional"`
		FinishReason string      `json:"finish_reason,omitempty" validate:"optional"`
	} `json:"choices,omitempty" validate:"optional"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens,omitempty" validate:"optional"`
		CompletionTokens int `json:"completion_tokens,omitempty" validate:"optional"`
		TotalTokens      int `json:"total_tokens,omitempty" validate:"optional"`
	} `json:"usage,omitempty" validate:"optional"`

	Error *ChatCompletionError `json:"error,omitempty" validate:"optional"`
}

type ChatCompletionError struct {
	Message string      `json:"message,omitempty" validate:"optional"`
	Type    string      `json:"type,omitempty" validate:"optional"`
	Param   interface{} `json:"param,omitempty" validate:"optional"`
	Code    interface{} `json:"code,omitempty" validate:"optional"`
}

type ChatCompletionMessage struct {
	Role    string `json:"role,omitempty" validate:"optional"`
	Content string `json:"content,omitempty" validate:"optional"`
}
