package com.example.multilang.config;

public class DbContext {
    private static final ThreadLocal<String> DB_TYPE = new ThreadLocal<>();

    public static final String SQL = "sql";
    public static final String MONGO = "mongo";

    public static void setDbType(String dbType) {
        DB_TYPE.set(dbType != null ? dbType.toLowerCase() : SQL);
    }

    public static String getDbType() {
        String t = DB_TYPE.get();
        return (t != null && (SQL.equals(t) || MONGO.equals(t))) ? t : SQL;
    }

    public static void clear() {
        DB_TYPE.remove();
    }
}
