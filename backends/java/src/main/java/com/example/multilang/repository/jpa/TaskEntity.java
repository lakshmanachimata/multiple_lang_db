package com.example.multilang.repository.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String title;
    @Column(length = 2000)
    private String description;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "created_at")
    private Instant createdAt;
}
