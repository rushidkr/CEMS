package com.cems.service.impl;

import com.cems.dto.request.FeedbackRequest;
import com.cems.dto.response.FeedbackResponse;
import com.cems.entity.Event;
import com.cems.entity.Feedback;
import com.cems.entity.User;
import com.cems.enums.RegistrationStatus;
import com.cems.exception.BadRequestException;
import com.cems.exception.ResourceNotFoundException;
import com.cems.repository.EventRepository;
import com.cems.repository.FeedbackRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional
    public FeedbackResponse submit(Long eventId, FeedbackRequest request, User student) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        boolean attended = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
                .map(r -> r.getStatus() == RegistrationStatus.ATTENDED)
                .orElse(false);

        if (!attended) {
            throw new BadRequestException("Only students who attended the event can leave feedback");
        }

        if (feedbackRepository.existsByEventIdAndStudentId(eventId, student.getId())) {
            throw new BadRequestException("You have already submitted feedback for this event");
        }

        Feedback feedback = Feedback.builder()
                .event(event)
                .student(student)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    public List<FeedbackResponse> getForEvent(Long eventId) {
        return feedbackRepository.findByEventId(eventId).stream().map(this::toResponse).toList();
    }

    @Override
    public Double getAverageRating(Long eventId) {
        Double avg = feedbackRepository.findAverageRatingForEvent(eventId);
        return avg == null ? 0.0 : avg;
    }

    private FeedbackResponse toResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .eventId(f.getEvent().getId())
                .studentName(f.getStudent().getFullName())
                .rating(f.getRating())
                .comment(f.getComment())
                .submittedAt(f.getSubmittedAt())
                .build();
    }
}
