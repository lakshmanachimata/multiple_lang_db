package com.example.multilang.repository.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "tasks")
public class TaskDocument {
    @Id
    private String id;
    private String title;
    private String description;
    @Indexed
    private String userId;
    private Instant createdAt;

    public TaskDocument() {}
    public TaskDocument(String id, String title, String description, String userId, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.createdAt = createdAt;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
