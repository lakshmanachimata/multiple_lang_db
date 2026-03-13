package com.example.multilang.repository.jpa;

import com.example.multilang.domain.Task;
import com.example.multilang.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Qualifier("jpa")
@RequiredArgsConstructor
public class TaskRepositoryJpa implements TaskRepository {
    private final TaskJpaRepository jpaRepository;

    @Override
    public Task save(Task task) {
        TaskEntity entity = TaskEntity.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .userId(task.getUserId())
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt() : java.time.Instant.now())
                .build();
        TaskEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Task> findById(String id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Task> findByUserId(String userId) {
        return jpaRepository.findByUserId(userId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    private Task toDomain(TaskEntity e) {
        return Task.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .userId(e.getUserId())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
