package com.cems.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FeedbackResponse {
    private Long id;
    private Long eventId;
    private String studentName;
    private Integer rating;
    private String comment;
    private LocalDateTime submittedAt;
}
