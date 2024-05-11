package repository

import (
	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
	"github.com/elastic/go-elasticsearch/v8"
)

func NewMessageRepository(firestore firestore.Client) MessagesIFace {
	return &MessagesRepo{firestore: firestore}
}

func NewClientUserRepository(firestore firestore.Client, authClient auth.Client) ClientUserIFace {
	return &ClientUserRepo{firestore: firestore, authClient: authClient}
}

func NewRecipeRepository(elastic elasticsearch.Client) RecipeIFace {
	return &RecipeRepo{elastic: elastic}
}

func NewMenuRepository(firestore firestore.Client) MenuIFace {
	return &MenuRepo{firestore: firestore}
}

func NewDailyPlanRepository(firestore firestore.Client) DailyPlanIFace {
	return &DailyPlanRepo{firestore: firestore}
}

func NewOpenAIRepository(secretKey string, chatCompletionUrl string, imageGenerationUrl string) OpenAIIFace {
	return &OpenAIRepo{secretKey: secretKey, chatCompletionUrl: chatCompletionUrl, imageGenerationUrl: imageGenerationUrl}
}

func NewCoreScheduler(firestore firestore.Client) SchedulerIFace {
	return &SchedulerRepo{firestore: firestore}
}
