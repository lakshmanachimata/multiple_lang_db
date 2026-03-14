package com.example.multilang.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.media.StringSchema;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";
    private static final String X_DB_TYPE = "X-DB-Type";

    @Bean
    public OpenAPI openAPI() {
        SecurityScheme scheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT from /api/auth/login or /api/auth/register. Enter the token only (no 'Bearer ' prefix).");

        return new OpenAPI()
                .info(new Info()
                        .title("Multi-Lang Backend Java API")
                        .version("1.0")
                        .description("Auth (register/login) and task CRUD. Use **Authorize** to set JWT (from login/register). Set **X-DB-Type** header to sql or mongo."))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, scheme));
    }

    /**
     * Adds X-DB-Type header to every operation so Swagger UI can send sql or mongo.
     */
    @Bean
    public GlobalOpenApiCustomizer globalHeaderCustomizer() {
        StringSchema dbSchema = new StringSchema();
        dbSchema.setEnum(List.of("sql", "mongo"));
        dbSchema.setDefault("sql");
        Parameter dbTypeParam = new Parameter()
                .in("header")
                .name(X_DB_TYPE)
                .description("Database to use for this request: sql (default) or mongo")
                .required(false)
                .schema(dbSchema);

        return openApi -> {
            if (openApi.getPaths() == null) return;
            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation ->
                            operation.addParametersItem(dbTypeParam)));
        };
    }
}
