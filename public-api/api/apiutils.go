package api

import (
	"html"
	"net/http"
	"reflect"
)

type APIResponse struct {
	Status      int     `json:"status,omitempty"`
	Content     []byte  `json:"content,omitempty"`
	ContentType *string `json:"contentType,omitempty"`
}

var (
	ContentTypeJSON = "application/json"

	ContentUnauthorized        = "Unauthorized\n"
	ContentOK                  = "OK\n"
	ContentInternalServerError = "Internal Server Error\n"
	ContentBadRequestError     = "Bad Request\n"
	ContentNotFoundError       = "Not Found\n"
)

func DefaultUnauthorized() APIResponse {
	return Unauthorized([]byte(ContentUnauthorized))
}

func Unauthorized(content []byte) APIResponse {
	return APIResponse{
		Status:  http.StatusUnauthorized,
		Content: content,
	}
}

func DefaultNotFoundError() APIResponse {
	return NotFoundError([]byte(ContentNotFoundError))
}

func NotFoundError(content []byte) APIResponse {
	return APIResponse{
		Status:  http.StatusNotFound,
		Content: content,
	}
}

func DefaultInternalServerError() APIResponse {
	return InternalServerError([]byte(ContentInternalServerError))
}

func InternalServerError(content []byte) APIResponse {
	return APIResponse{
		Status:  http.StatusInternalServerError,
		Content: content,
	}
}

func DefaultBadRequestError() APIResponse {
	return BadRequestError([]byte(ContentBadRequestError))
}

func BadRequestError(content []byte) APIResponse {
	return APIResponse{
		Status:  http.StatusBadRequest,
		Content: content,
	}
}

func DefaultOK() APIResponse {
	return OK([]byte(ContentOK))
}

func OKContentType(content []byte, contentType string) APIResponse {
	return APIResponse{
		Status:      http.StatusOK,
		Content:     content,
		ContentType: &contentType,
	}
}

func OK(content []byte) APIResponse {
	return APIResponse{
		Status:  http.StatusOK,
		Content: content,
	}
}

func HTMLSanitizer(input any) {

	v := reflect.ValueOf(input).Elem()

	sanitizeStruct(v)
}

func htmlSanitizer(input string) string {
	return html.EscapeString(input)
}

func sanitizeValue(v reflect.Value) {
	valueKind := v.Kind()

	switch valueKind {
	case reflect.String:
		if v.CanSet() {
			v.SetString(htmlSanitizer(v.String()))
		}

	case reflect.Slice,
		reflect.Array:
		for j := 0; j < v.Len(); j++ {
			jVal := v.Index(j)
			sanitizeStruct(jVal)
		}

	case reflect.Pointer:
		sanitizeValue(v.Elem())

	case reflect.Struct:
		sanitizeStruct(v)
	}
}

func sanitizeStruct(v reflect.Value) {
	valueKind := v.Kind()

	switch valueKind {

	case reflect.Struct:
		for i := 0; i < v.NumField(); i++ {
			sanitizeValue(v.Field(i))
		}

	case reflect.Array,
		reflect.Slice:
		for j := 0; j < v.Len(); j++ {
			sanitizeValue(v.Index(j))
		}

	case reflect.String:
		sanitizeValue(v)

	default:
	}
}

func GetParameterFromRequest(request *http.Request, param string) string {
	requestParam, exists := request.URL.Query()[param]

	if !exists {
		return ""
	}

	return requestParam[0]
}
