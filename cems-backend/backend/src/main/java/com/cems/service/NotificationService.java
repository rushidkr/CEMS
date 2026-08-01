package com.cems.service;

import com.cems.dto.response.NotificationResponse;
import com.cems.entity.User;
import com.cems.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void notify(User recipient, String message, NotificationType type, Long relatedEventId);
    Page<NotificationResponse> getForUser(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
