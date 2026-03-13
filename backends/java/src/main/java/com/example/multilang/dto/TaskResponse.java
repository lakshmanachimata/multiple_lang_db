package com.example.multilang.dto;

import com.example.multilang.domain.Task;
import lombok.Data;

import java.time.Instant;

@Data
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private String userId;
    private Instant createdAt;

    public static TaskResponse from(Task task) {
        TaskResponse r = new TaskResponse();
        r.setId(task.getId());
        r.setTitle(task.getTitle());
        r.setDescription(task.getDescription());
        r.setUserId(task.getUserId());
        r.setCreatedAt(task.getCreatedAt());
        return r;
    }
}
