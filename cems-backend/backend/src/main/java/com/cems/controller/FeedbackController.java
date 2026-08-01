package com.cems.controller;

import com.cems.dto.request.FeedbackRequest;
import com.cems.dto.response.FeedbackResponse;
import com.cems.security.CurrentUserProvider;
import com.cems.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events/{eventId}/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final CurrentUserProvider currentUser;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<FeedbackResponse> submit(@PathVariable Long eventId, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submit(eventId, request, currentUser.get()));
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(feedbackService.getForEvent(eventId));
    }

    @GetMapping("/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long eventId) {
        return ResponseEntity.ok(feedbackService.getAverageRating(eventId));
    }
}
