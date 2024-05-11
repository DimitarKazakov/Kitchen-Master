package entity

type Recipe struct {
	ID          string `json:"Id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageUrl    string `json:"imageUrl"`

	Ingredients  []string `json:"ingredients"`
	Instructions []string `json:"instructions"`
	Tags         []string `json:"tags"`

	PreparationTime string `json:"preparationTime"`
	CookingTime     string `json:"cookingTime"`
	AllTile         string `json:"allTime"`
	Portions        string `json:"portions"`

	Notes string `json:"notes"`
}

type RawRecipe struct {
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	ImageUrl        string   `json:"imageUrl"`
	PreparationTime string   `json:"preparationTime"`
	CookingTime     string   `json:"cookingTime"`
	AllTile         string   `json:"allTime"`
	Portions        string   `json:"portions"`
	Ingredients     []string `json:"ingredients"`
	Instructions    []string `json:"instructions"`
}
