package com.example.multilang.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class DbTypeFilter implements Filter {
    private static final String HEADER_X_DB_TYPE = "X-DB-Type";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            if (request instanceof HttpServletRequest httpRequest) {
                String dbType = httpRequest.getHeader(HEADER_X_DB_TYPE);
                DbContext.setDbType(dbType);
            }
            chain.doFilter(request, response);
        } finally {
            DbContext.clear();
        }
    }
}
