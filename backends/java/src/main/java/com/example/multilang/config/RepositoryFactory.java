package com.example.multilang.config;

import com.example.multilang.repository.TaskRepository;
import com.example.multilang.repository.UserRepository;
import com.example.multilang.repository.jpa.TaskRepositoryJpa;
import com.example.multilang.repository.jpa.UserRepositoryJpa;
import com.example.multilang.repository.mongo.TaskRepositoryMongo;
import com.example.multilang.repository.mongo.UserRepositoryMongo;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class RepositoryFactory {
    private final UserRepositoryJpa userRepositoryJpa;
    private final UserRepositoryMongo userRepositoryMongo;
    private final TaskRepositoryJpa taskRepositoryJpa;
    private final TaskRepositoryMongo taskRepositoryMongo;

    public RepositoryFactory(@Qualifier("jpa") UserRepositoryJpa userRepositoryJpa,
                             @Qualifier("mongo") UserRepositoryMongo userRepositoryMongo,
                             @Qualifier("jpa") TaskRepositoryJpa taskRepositoryJpa,
                             @Qualifier("mongo") TaskRepositoryMongo taskRepositoryMongo) {
        this.userRepositoryJpa = userRepositoryJpa;
        this.userRepositoryMongo = userRepositoryMongo;
        this.taskRepositoryJpa = taskRepositoryJpa;
        this.taskRepositoryMongo = taskRepositoryMongo;
    }

    public UserRepository getUserRepository() {
        return DbContext.MONGO.equals(DbContext.getDbType()) ? userRepositoryMongo : userRepositoryJpa;
    }

    public TaskRepository getTaskRepository() {
        return DbContext.MONGO.equals(DbContext.getDbType()) ? taskRepositoryMongo : taskRepositoryJpa;
    }
}
