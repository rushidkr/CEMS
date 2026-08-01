package com.cems.service.impl;

import com.cems.dto.response.RegistrationResponse;
import com.cems.entity.Event;
import com.cems.entity.Registration;
import com.cems.entity.User;
import com.cems.enums.EventStatus;
import com.cems.enums.NotificationType;
import com.cems.enums.RegistrationStatus;
import com.cems.enums.Role;
import com.cems.exception.BadRequestException;
import com.cems.exception.ResourceNotFoundException;
import com.cems.exception.UnauthorizedActionException;
import com.cems.repository.EventRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.service.NotificationService;
import com.cems.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public RegistrationResponse register(Long eventId, User student) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.APPROVED) {
            throw new BadRequestException("You can only register for approved events");
        }

        if (LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BadRequestException("Registration deadline has passed for this event");
        }

        if (registrationRepository.existsByEventIdAndStudentId(eventId, student.getId())) {
            throw new BadRequestException("You are already registered for this event");
        }

        long confirmedCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.REGISTERED);
        RegistrationStatus status = confirmedCount < event.getCapacity()
                ? RegistrationStatus.REGISTERED
                : RegistrationStatus.WAITLISTED;

        Registration registration = Registration.builder()
                .event(event)
                .student(student)
                .status(status)
                .build();

        Registration saved = registrationRepository.save(registration);

        notificationService.notify(
                student,
                status == RegistrationStatus.REGISTERED
                        ? "You're confirmed for \"%s\"".formatted(event.getTitle())
                        : "You're on the waitlist for \"%s\"".formatted(event.getTitle()),
                status == RegistrationStatus.REGISTERED
                        ? NotificationType.REGISTRATION_CONFIRMED
                        : NotificationType.REGISTRATION_WAITLISTED,
                event.getId()
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void cancel(Long eventId, User student) {
        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not registered for this event"));

        boolean wasConfirmed = registration.getStatus() == RegistrationStatus.REGISTERED;
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);

        // Promote the earliest waitlisted student into the freed seat, if any
        if (wasConfirmed) {
            List<Registration> waitlisted = registrationRepository
                    .findByEventIdAndStatus(eventId, RegistrationStatus.WAITLISTED);

            waitlisted.stream()
                    .min((a, b) -> a.getRegisteredAt().compareTo(b.getRegisteredAt())) // earliest joined first
                    .ifPresent(next -> {
                        next.setStatus(RegistrationStatus.REGISTERED);
                        registrationRepository.save(next);
                        notificationService.notify(
                                next.getStudent(),
                                "A seat opened up — you're now confirmed for \"%s\""
                                        .formatted(next.getEvent().getTitle()),
                                NotificationType.REGISTRATION_CONFIRMED,
                                next.getEvent().getId()
                        );
                    });
        }
    }

    @Override
    @Transactional
    public RegistrationResponse checkIn(Long eventId, Long studentId, User requester) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.getOrganizer().getId().equals(requester.getId()) && requester.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only the organizer or an admin can check in attendees");
        }

        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for this student"));

        if (registration.getStatus() != RegistrationStatus.REGISTERED) {
            throw new BadRequestException("Only confirmed registrations can be checked in");
        }

        registration.setStatus(RegistrationStatus.ATTENDED);
        registration.setCheckedInAt(LocalDateTime.now());

        return toResponse(registrationRepository.save(registration));
    }

    @Override
    public Page<RegistrationResponse> getForStudent(Long studentId, Pageable pageable) {
        return registrationRepository.findByStudentId(studentId, pageable).map(this::toResponse);
    }

    @Override
    public List<RegistrationResponse> getForEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream().map(this::toResponse).toList();
    }

    private RegistrationResponse toResponse(Registration r) {
        return RegistrationResponse.builder()
                .id(r.getId())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getFullName())
                .status(r.getStatus())
                .registeredAt(r.getRegisteredAt())
                .checkedInAt(r.getCheckedInAt())
                .build();
    }
}
