package com.example.multilang.repository.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskJpaRepository extends JpaRepository<TaskEntity, String> {
    List<TaskEntity> findByUserId(String userId);
}
