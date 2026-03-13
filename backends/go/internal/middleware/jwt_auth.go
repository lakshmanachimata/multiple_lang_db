package middleware

import (
	"net/http"
	"strings"

	"multi-lang-backend-go/internal/jwt"

	"github.com/gin-gonic/gin"
)

const BearerPrefix = "Bearer "

func JwtAuth(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, BearerPrefix) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid authorization"})
			return
		}
		tokenString := strings.TrimPrefix(auth, BearerPrefix)
		claims, err := jwtManager.Validate(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}
