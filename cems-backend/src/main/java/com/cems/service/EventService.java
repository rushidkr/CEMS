package com.cems.service;

import com.cems.dto.request.EventRequest;
import com.cems.dto.response.EventResponse;
import com.cems.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {
    EventResponse create(EventRequest request, User organizer);
    EventResponse update(Long eventId, EventRequest request, User requester);
    EventResponse approve(Long eventId, User admin);
    EventResponse reject(Long eventId, String reason, User admin);
    EventResponse cancel(Long eventId, User requester);
    EventResponse getById(Long eventId);
    Page<EventResponse> getUpcoming(String category, String keyword, Pageable pageable);
    Page<EventResponse> getByOrganizer(Long organizerId, Pageable pageable);
    Page<EventResponse> getByStatus(String status, Pageable pageable);
    void sendRemindersForUpcomingEvents();
}
