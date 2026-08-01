package com.cems.controller;

import com.cems.dto.request.EventRequest;
import com.cems.dto.request.RejectEventRequest;
import com.cems.dto.response.EventResponse;
import com.cems.security.CurrentUserProvider;
import com.cems.service.EventService;
import com.cems.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final CurrentUserProvider currentUser;
    private final PdfService pdfService;
    private final com.cems.repository.EventRepository eventRepository;
    private final com.cems.repository.RegistrationRepository registrationRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> create(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request, currentUser.get()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.update(id, request, currentUser.get()));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.approve(id, currentUser.get()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> reject(@PathVariable Long id, @Valid @RequestBody RejectEventRequest request) {
        return ResponseEntity.ok(eventService.reject(id, request.getReason(), currentUser.get()));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.cancel(id, currentUser.get()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    @GetMapping("/{id}/export-attendees")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<byte[]> exportAttendeesPdf(@PathVariable Long id) {
        com.cems.entity.Event event = eventRepository.findById(id)
                .orElseThrow(() -> new com.cems.exception.ResourceNotFoundException("Event not found with id: " + id));

        var registrations = registrationRepository.findByEventId(id);
        var pdfStream = pdfService.generateAttendeeRosterPdf(event, registrations);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendees_event_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfStream.readAllBytes());
    }

    // Public, paginated, searchable list of approved upcoming events
    @GetMapping("/public/upcoming")
    public ResponseEntity<Page<EventResponse>> getUpcoming(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(eventService.getUpcoming(category, keyword, pageable));
    }

    @GetMapping("/organizer/{organizerId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Page<EventResponse>> getByOrganizer(@PathVariable Long organizerId, Pageable pageable) {
        return ResponseEntity.ok(eventService.getByOrganizer(organizerId, pageable));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Page<EventResponse>> getByStatus(@PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(eventService.getByStatus(status, pageable));
    }
}

