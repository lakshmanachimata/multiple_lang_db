package dbcontext

const (
	SQL   = "sql"
	Mongo = "mongo"
)

var dbType string

func SetDbType(t string) {
	if t == Mongo || t == "mongo" {
		dbType = Mongo
		return
	}
	dbType = SQL
}

func GetDbType() string {
	if dbType == "" {
		return SQL
	}
	return dbType
}
