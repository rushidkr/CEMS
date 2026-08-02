package com.cems.dto.response;

import com.cems.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long relatedEventId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
