package com.example.multilang.repository;

import com.example.multilang.domain.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRepository {
    Task save(Task task);
    Optional<Task> findById(String id);
    List<Task> findByUserId(String userId);
    void deleteById(String id);
}
