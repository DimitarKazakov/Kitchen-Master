package entity

type ClientUser struct {
	ID                string   `firestore:"Id" json:"Id"`
	Username          string   `firestore:"username" json:"username"`
	Email             string   `firestore:"email" json:"email"`
	ElasticIndex      string   `firestore:"elasticIndex" json:"elasticIndex"`           // NOTE: index name in elastic search
	ImportedRecipes   []string `firestore:"importedRecipes" json:"importedRecipes"`     // NOTE: keeps track of imported files
	AutoImportEnabled bool     `firestore:"autoImportEnabled" json:"autoImportEnabled"` // NOTE: if auto imported is enabled we import new recipe files automatically
	Subscription      string   `firestore:"subscription" json:"subscription"`           // NOTE: FREE subscription has limited access
	FavoriteRecipeIDs []string `firestore:"favoriteRecipeIDs" json:"favoriteRecipeIDs"`
	Height            int      `firestore:"height" json:"height"`
	Weight            int      `firestore:"weight" json:"weight"`
	Protein           float64  `firestore:"protein" json:"protein"`
	Carbohydrates     float64  `firestore:"carbohydrates" json:"carbohydrates"`
	Fats              float64  `firestore:"fats" json:"fats"`
	Calories          float64  `firestore:"calories" json:"calories"`
	Allergies         []string `firestore:"allergies" json:"allergies"`
	Billing           float64  `firestore:"billing" json:"billing"`
}
