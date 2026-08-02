package com.cems.controller;

import com.cems.dto.response.RegistrationResponse;
import com.cems.security.CurrentUserProvider;
import com.cems.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;
    private final CurrentUserProvider currentUser;
    private final com.cems.service.PdfService pdfService;
    private final com.cems.repository.RegistrationRepository registrationRepository;

    @PostMapping("/events/{eventId}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponse> register(@PathVariable Long eventId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(eventId, currentUser.get()));
    }

    @DeleteMapping("/events/{eventId}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> cancel(@PathVariable Long eventId) {
        registrationService.cancel(eventId, currentUser.get());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/events/{eventId}/check-in/{studentId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<RegistrationResponse> checkIn(@PathVariable Long eventId, @PathVariable Long studentId) {
        return ResponseEntity.ok(registrationService.checkIn(eventId, studentId, currentUser.get()));
    }

    @GetMapping("/students/{studentId}/registrations")
    public ResponseEntity<Page<RegistrationResponse>> getForStudent(@PathVariable Long studentId, Pageable pageable) {
        return ResponseEntity.ok(registrationService.getForStudent(studentId, pageable));
    }

    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getForEvent(eventId));
    }

    @GetMapping("/registrations/{id}/ticket")
    public ResponseEntity<byte[]> getTicketPdf(@PathVariable Long id) {
        com.cems.entity.Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new com.cems.exception.ResourceNotFoundException("Registration not found with id: " + id));

        var pdfStream = pdfService.generateRegistrationTicketPdf(reg);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=event_pass_ticket_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfStream.readAllBytes());
    }
}

