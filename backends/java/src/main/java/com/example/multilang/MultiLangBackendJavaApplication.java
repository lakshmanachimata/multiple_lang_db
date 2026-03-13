package com.example.multilang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
public class MultiLangBackendJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiLangBackendJavaApplication.class, args);
    }
}
