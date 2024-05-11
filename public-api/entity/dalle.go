package entity

type DalleRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      int    `json:"n"`
	Size   string `json:"size"`
}

type DalleResponse struct {
	Data []DalleImageData `json:"data"`
}

type DalleImageData struct {
	URL string `json:"url"`
}
