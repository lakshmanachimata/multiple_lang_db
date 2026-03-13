package middleware

import (
	"multi-lang-backend-go/internal/dbcontext"

	"github.com/gin-gonic/gin"
)

const HeaderXDBType = "X-DB-Type"

func DbType() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := c.GetHeader(HeaderXDBType)
		dbcontext.SetDbType(t)
		c.Next()
	}
}
