package entity

type Menu struct {
	ID     string `firestore:"Id" json:"Id"`
	UserId string `firestore:"userId" json:"userId"`

	Recipes []Recipe `firestore:"recipes" json:"recipes"`
	Event   string   `firestore:"event" json:"event"`
}
