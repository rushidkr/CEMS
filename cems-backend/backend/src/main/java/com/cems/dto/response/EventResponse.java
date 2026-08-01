package com.cems.dto.response;

import com.cems.enums.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Long venueId;
    private String venueName;
    private String venueLocation;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer registeredCount;
    private Integer seatsAvailable;
    private LocalDateTime registrationDeadline;
    private EventStatus status;
    private String rejectionReason;
    private Double averageRating;
    private LocalDateTime createdAt;
}
