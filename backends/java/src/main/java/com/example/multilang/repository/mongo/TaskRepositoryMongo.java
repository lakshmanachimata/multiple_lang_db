package com.example.multilang.repository.mongo;

import com.example.multilang.domain.Task;
import com.example.multilang.repository.TaskRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;


import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@Qualifier("mongo")
public class TaskRepositoryMongo implements TaskRepository {
    private final MongoTemplate mongoTemplate;

    public TaskRepositoryMongo(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Task save(Task task) {
        String id = task.getId() != null ? task.getId() : UUID.randomUUID().toString();
        Instant createdAt = task.getCreatedAt() != null ? task.getCreatedAt() : Instant.now();
        TaskDocument doc = new TaskDocument(id, task.getTitle(), task.getDescription(), task.getUserId(), createdAt);
        TaskDocument saved = mongoTemplate.save(doc);
        return toDomain(saved);
    }

    @Override
    public Optional<Task> findById(String id) {
        TaskDocument doc = mongoTemplate.findById(id, TaskDocument.class);
        return Optional.ofNullable(doc).map(this::toDomain);
    }

    @Override
    public List<Task> findByUserId(String userId) {
        List<TaskDocument> docs = mongoTemplate.find(
                Query.query(Criteria.where("userId").is(userId)),
                TaskDocument.class
        );
        return docs.stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        mongoTemplate.remove(Query.query(Criteria.where("id").is(id)), TaskDocument.class);
    }

    private Task toDomain(TaskDocument d) {
        return Task.builder()
                .id(d.getId())
                .title(d.getTitle())
                .description(d.getDescription())
                .userId(d.getUserId())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
