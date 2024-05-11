package entity

type Document struct {
	Source interface{} `json:"_source"`
}

type SearchHits struct {
	Hits Hits `json:"hits"`
}

type Hits struct {
	Total Total  `json:"total"`
	Hits  []*Hit `json:"hits"`
}

type Total struct {
	Value int `json:"value"`
}

type Hit struct {
	Source *Recipe `json:"_source"`
}
