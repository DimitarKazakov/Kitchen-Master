package entity

type CoreScheduler struct {
	ID             string `firestore:"Id" json:"Id"`
	TaskName       string `firestore:"taskName" json:"taskName"`
	LastRunStart   string `firestore:"lastRunStart,omitempty" json:"lastRunStart,omitempty"`
	LastRunEnd     string `firestore:"lastRunEnd,omitempty" json:"lastRunEnd,omitempty"`
	Every          int    `firestore:"every" json:"every"` //NOTE: every x hours
	Enabled        bool   `firestore:"enabled" json:"enabled"`
	IsRunningNow   bool   `firestore:"isRunningNow" json:"isRunningNow"`
	AdditionalInfo string `firestore:"additionalInfo" json:"additionalInfo"`
}
