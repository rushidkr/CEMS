package com.cems.service.impl;

import com.cems.dto.request.EventRequest;
import com.cems.dto.response.EventResponse;
import com.cems.entity.Event;
import com.cems.entity.Registration;
import com.cems.entity.User;
import com.cems.entity.Venue;
import com.cems.enums.EventStatus;
import com.cems.enums.NotificationType;
import com.cems.enums.RegistrationStatus;
import com.cems.enums.Role;
import com.cems.exception.BadRequestException;
import com.cems.exception.ResourceNotFoundException;
import com.cems.exception.UnauthorizedActionException;
import com.cems.repository.EventRepository;
import com.cems.repository.FeedbackRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.VenueRepository;
import com.cems.service.EventService;
import com.cems.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final RegistrationRepository registrationRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public EventResponse create(EventRequest request, User organizer) {
        validateTimeWindow(request);

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + request.getVenueId()));

        if (request.getCapacity() > venue.getCapacity()) {
            throw new BadRequestException(
                    "Event capacity (%d) exceeds venue capacity (%d)".formatted(request.getCapacity(), venue.getCapacity()));
        }

        List<Venue> available = venueRepository.findAvailableVenues(request.getStartTime(), request.getEndTime());
        boolean venueIsFree = available.stream().anyMatch(v -> v.getId().equals(venue.getId()));
        if (!venueIsFree) {
            throw new BadRequestException("Venue is already booked for an overlapping time slot");
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .venue(venue)
                .organizer(organizer)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .registrationDeadline(request.getRegistrationDeadline())
                .status(EventStatus.PENDING)
                .build();

        Event saved = eventRepository.save(event);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse update(Long eventId, EventRequest request, User requester) {
        Event event = getEventOrThrow(eventId);

        if (!event.getOrganizer().getId().equals(requester.getId()) && requester.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only the organizer or an admin can update this event");
        }

        if (event.getStatus() == EventStatus.APPROVED || event.getStatus() == EventStatus.COMPLETED) {
            throw new BadRequestException("Approved or completed events cannot be edited");
        }

        validateTimeWindow(request);

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + request.getVenueId()));

        if (request.getCapacity() > venue.getCapacity()) {
            throw new BadRequestException(
                    "Event capacity (%d) exceeds venue capacity (%d)".formatted(request.getCapacity(), venue.getCapacity()));
        }

        boolean venueOrTimeChanged = !event.getVenue().getId().equals(venue.getId())
                || !event.getStartTime().equals(request.getStartTime())
                || !event.getEndTime().equals(request.getEndTime());

        if (venueOrTimeChanged) {
            List<Venue> available = venueRepository.findAvailableVenuesExcludingEvent(
                    request.getStartTime(), request.getEndTime(), event.getId());
            boolean venueIsFree = available.stream().anyMatch(v -> v.getId().equals(venue.getId()));
            if (!venueIsFree) {
                throw new BadRequestException("Venue is already booked for an overlapping time slot");
            }
        }
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(venue);
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());
        event.setRegistrationDeadline(request.getRegistrationDeadline());

        if (event.getStatus() == EventStatus.REJECTED) {
            event.setStatus(EventStatus.PENDING);
            event.setRejectionReason(null);
        }

        return toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse approve(Long eventId, User admin) {
        Event event = getEventOrThrow(eventId);

        if (event.getStatus() != EventStatus.PENDING) {
            throw new BadRequestException("Only pending events can be approved");
        }

        event.setStatus(EventStatus.APPROVED);
        Event saved = eventRepository.save(event);

        notificationService.notify(
                event.getOrganizer(),
                "Your event \"%s\" has been approved".formatted(event.getTitle()),
                NotificationType.EVENT_APPROVED,
                event.getId()
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse reject(Long eventId, String reason, User admin) {
        Event event = getEventOrThrow(eventId);

        if (event.getStatus() != EventStatus.PENDING) {
            throw new BadRequestException("Only pending events can be rejected");
        }

        event.setStatus(EventStatus.REJECTED);
        event.setRejectionReason(reason);
        Event saved = eventRepository.save(event);

        notificationService.notify(
                event.getOrganizer(),
                "Your event \"%s\" was rejected: %s".formatted(event.getTitle(), reason),
                NotificationType.EVENT_REJECTED,
                event.getId()
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse cancel(Long eventId, User requester) {
        Event event = getEventOrThrow(eventId);

        if (!event.getOrganizer().getId().equals(requester.getId()) && requester.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only the organizer or an admin can cancel this event");
        }

        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED) {
            throw new BadRequestException("This event cannot be cancelled");
        }

        event.setStatus(EventStatus.CANCELLED);
        Event saved = eventRepository.save(event);

        List<Registration> registrations =
                registrationRepository.findByEventIdAndStatus(eventId, RegistrationStatus.REGISTERED);

        for (Registration reg : registrations) {
            notificationService.notify(
                    reg.getStudent(),
                    "Event \"%s\" you registered for has been cancelled".formatted(event.getTitle()),
                    NotificationType.EVENT_CANCELLED,
                    event.getId()
            );
        }

        return toResponse(saved);
    }

    @Override
    public EventResponse getById(Long eventId) {
        return toResponse(getEventOrThrow(eventId));
    }

    @Override
    public Page<EventResponse> getUpcoming(String category, String keyword, Pageable pageable) {
        return eventRepository.searchUpcoming(
                (category == null || category.isBlank()) ? null : category,
                (keyword == null || keyword.isBlank()) ? null : keyword,
                LocalDateTime.now(),
                pageable
        ).map(this::toResponse);
    }

    @Override
    public Page<EventResponse> getByOrganizer(Long organizerId, Pageable pageable) {
        return eventRepository.findByOrganizerId(organizerId, pageable).map(this::toResponse);
    }

    @Override
    public Page<EventResponse> getByStatus(String status, Pageable pageable) {
        if ("ALL".equalsIgnoreCase(status)) {
            return eventRepository.findAll(pageable).map(this::toResponse);
        }
        EventStatus eventStatus;
        try {
            eventStatus = EventStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status: " + status);
        }
        return eventRepository.findByStatus(eventStatus, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void sendRemindersForUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime window = now.plusHours(24);

        List<Event> startingSoon = eventRepository.findEventsStartingSoon(now, window);

        for (Event event : startingSoon) {
            List<Registration> regs =
                    registrationRepository.findByEventIdAndStatus(event.getId(), RegistrationStatus.REGISTERED);

            for (Registration reg : regs) {
                notificationService.notify(
                        reg.getStudent(),
                        "Reminder: \"%s\" starts soon".formatted(event.getTitle()),
                        NotificationType.EVENT_REMINDER,
                        event.getId()
                );
            }
        }
    }

    // ---- helpers ----

    private Event getEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    private void validateTimeWindow(EventRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        if (!request.getRegistrationDeadline().isBefore(request.getStartTime())) {
            throw new BadRequestException("Registration deadline must be before the event start time");
        }
    }

    private EventResponse toResponse(Event event) {
        long registeredCount = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.REGISTERED);
        Double avgRating = feedbackRepository.findAverageRatingForEvent(event.getId());

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .venueId(event.getVenue().getId())
                .venueName(event.getVenue().getName())
                .venueLocation(event.getVenue().getLocation())
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getFullName())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .capacity(event.getCapacity())
                .registeredCount((int) registeredCount)
                .seatsAvailable(event.getCapacity() - (int) registeredCount)
                .registrationDeadline(event.getRegistrationDeadline())
                .status(event.getStatus())
                .rejectionReason(event.getRejectionReason())
                .averageRating(avgRating)
                .createdAt(event.getCreatedAt())
                .build();
    }
}
