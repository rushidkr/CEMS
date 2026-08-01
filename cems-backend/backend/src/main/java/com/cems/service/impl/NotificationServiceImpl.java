package com.cems.service.impl;

import com.cems.dto.response.NotificationResponse;
import com.cems.entity.Notification;
import com.cems.entity.User;
import com.cems.enums.NotificationType;
import com.cems.exception.ResourceNotFoundException;
import com.cems.exception.UnauthorizedActionException;
import com.cems.repository.NotificationRepository;
import com.cems.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void notify(User recipient, String message, NotificationType type, Long relatedEventId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(titleFor(type))
                .message(message)
                .type(type)
                .relatedEventId(relatedEventId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .relatedEventId(notification.getRelatedEventId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new UnauthorizedActionException("You cannot modify another user's notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .forEach(n -> n.setRead(true));
    }

    private String titleFor(NotificationType type) {
        return switch (type) {
            case EVENT_APPROVED ->
                "Event Approved";
            case EVENT_REJECTED ->
                "Event Rejected";
            case EVENT_CANCELLED ->
                "Event Cancelled";
            case REGISTRATION_CONFIRMED ->
                "Registration Confirmed";
            case REGISTRATION_WAITLISTED ->
                "Added to Waitlist";
            case EVENT_REMINDER ->
                "Upcoming Event Reminder";
            case FEEDBACK_REQUEST ->
                "Share Your Feedback";
            case GENERAL ->
                "Notification";
        };
    }
}
