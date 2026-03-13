package com.example.multilang.service;

import com.example.multilang.config.RepositoryFactory;
import com.example.multilang.domain.Task;
import com.example.multilang.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final RepositoryFactory repositoryFactory;

    public List<Task> findByUserId(String userId) {
        TaskRepository repo = repositoryFactory.getTaskRepository();
        return repo.findByUserId(userId);
    }

    public Task create(String userId, String title, String description) {
        TaskRepository repo = repositoryFactory.getTaskRepository();
        Task task = Task.builder()
                .title(title)
                .description(description != null ? description : "")
                .userId(userId)
                .createdAt(Instant.now())
                .build();
        return repo.save(task);
    }

    public Task getById(String id, String userId) {
        TaskRepository repo = repositoryFactory.getTaskRepository();
        return repo.findById(id)
                .filter(t -> userId.equals(t.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
    }

    public Task update(String id, String userId, String title, String description) {
        TaskRepository repo = repositoryFactory.getTaskRepository();
        Task existing = getById(id, userId);
        Task updated = Task.builder()
                .id(existing.getId())
                .title(title != null ? title : existing.getTitle())
                .description(description != null ? description : existing.getDescription())
                .userId(existing.getUserId())
                .createdAt(existing.getCreatedAt())
                .build();
        return repo.save(updated);
    }

    public void delete(String id, String userId) {
        getById(id, userId);
        repositoryFactory.getTaskRepository().deleteById(id);
    }
}
