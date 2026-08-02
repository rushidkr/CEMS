package com.cems.service.impl;

import com.cems.dto.response.DashboardStatsResponse;
import com.cems.enums.EventStatus;
import com.cems.enums.Role;
import com.cems.repository.EventRepository;
import com.cems.repository.FeedbackRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.UserRepository;
import com.cems.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long totalEvents = eventRepository.count();
        long pending = eventRepository.countByStatus(EventStatus.PENDING);
        long approved = eventRepository.countByStatus(EventStatus.APPROVED);
        long completed = eventRepository.countByStatus(EventStatus.COMPLETED);
        long cancelled = eventRepository.countByStatus(EventStatus.CANCELLED);

        long students = userRepository.findByRole(Role.STUDENT).size();
        long organizers = userRepository.findByRole(Role.ORGANIZER).size();

        long totalRegistrations = registrationRepository.count();

        double avgRating = eventRepository.findAll().stream()
                .map(e -> feedbackRepository.findAverageRatingForEvent(e.getId()))
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        java.util.Map<String, Long> byCategory = eventRepository.findAll().stream()
                .filter(e -> e.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getCategory(),
                        java.util.stream.Collectors.counting()
                ));

        return DashboardStatsResponse.builder()
                .totalEvents(totalEvents)
                .pendingEvents(pending)
                .approvedEvents(approved)
                .completedEvents(completed)
                .cancelledEvents(cancelled)
                .totalStudents(students)
                .totalOrganizers(organizers)
                .totalRegistrations(totalRegistrations)
                .averageFeedbackRating(Math.round(avgRating * 100) / 100.0)
                .eventsByCategory(byCategory)
                .build();
    }
}
