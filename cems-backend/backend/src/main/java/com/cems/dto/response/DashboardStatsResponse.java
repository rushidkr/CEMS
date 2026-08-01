package com.cems.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalEvents;
    private long pendingEvents;
    private long approvedEvents;
    private long completedEvents;
    private long cancelledEvents;
    private long totalStudents;
    private long totalOrganizers;
    private long totalRegistrations;
    private double averageFeedbackRating;
    private Map<String, Long> eventsByCategory;
}
