package com.cems.controller;

import com.cems.dto.response.NotificationResponse;
import com.cems.security.CurrentUserProvider;
import com.cems.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUser;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getMine(Pageable pageable) {
        return ResponseEntity.ok(notificationService.getForUser(currentUser.get().getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount(currentUser.get().getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, currentUser.get().getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(currentUser.get().getId());
        return ResponseEntity.noContent().build();
    }
}
