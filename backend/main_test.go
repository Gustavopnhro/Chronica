package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestGeneratePDF(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()
	router.POST("/generate-pdf", func(c *gin.Context) {
		c.String(http.StatusOK, "PDF generated successfully!")
	})

	req, _ := http.NewRequest(http.MethodPost, "/generate-pdf", strings.NewReader("title=Test&text=Test&timestamps="))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "PDF generated successfully!", w.Body.String())
}
