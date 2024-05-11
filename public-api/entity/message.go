package entity

type Message struct {
	ID     string `firestore:"Id" json:"Id"`
	UserId string `firestore:"userId" json:"userId"`

	Title   string `firestore:"title" json:"title"`
	Content string `firestore:"content" json:"content"`
}
