package com.example.multilang.controller;

import com.example.multilang.domain.Task;
import com.example.multilang.dto.TaskRequest;
import com.example.multilang.dto.TaskResponse;
import com.example.multilang.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
    private final TaskService taskService;

    private String currentUserId(Authentication auth) {
        return auth != null && auth.getPrincipal() != null ? auth.getPrincipal().toString() : null;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> list(Authentication authentication) {
        String userId = currentUserId(authentication);
        List<Task> tasks = taskService.findByUserId(userId);
        return ResponseEntity.ok(tasks.stream().map(TaskResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request,
                                               Authentication authentication) {
        String userId = currentUserId(authentication);
        Task task = taskService.create(userId, request.getTitle(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(task));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> get(@PathVariable String id, Authentication authentication) {
        String userId = currentUserId(authentication);
        Task task = taskService.getById(id, userId);
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable String id,
                                               @Valid @RequestBody TaskRequest request,
                                               Authentication authentication) {
        String userId = currentUserId(authentication);
        Task task = taskService.update(id, userId, request.getTitle(), request.getDescription());
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        String userId = currentUserId(authentication);
        taskService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
