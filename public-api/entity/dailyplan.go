package entity

type DailyPlan struct {
	ID     string `firestore:"Id" json:"Id"`
	UserId string `firestore:"userId" json:"userId"`

	Day       string    `firestore:"day" json:"day"`
	Breakfast *MealPlan `firestore:"breakfast" json:"breakfast,omitempty" validate:"optional"`
	Lunch     *MealPlan `firestore:"lunch" json:"lunch,omitempty" validate:"optional"`
	Dinner    *MealPlan `firestore:"dinner" json:"dinner,omitempty" validate:"optional"`
}

type MealPlan struct {
	Calories      int      `firestore:"calories" json:"calories"`
	Protein       int      `firestore:"protein" json:"protein"`
	Carbohydrates int      `firestore:"carbohydrates" json:"carbohydrates"`
	Fats          int      `firestore:"fats" json:"fats"`
	Recipes       []Recipe `firestore:"recipes" json:"recipes"`
}
