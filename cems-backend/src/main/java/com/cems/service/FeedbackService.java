package com.cems.service;

import com.cems.dto.request.FeedbackRequest;
import com.cems.dto.response.FeedbackResponse;
import com.cems.entity.User;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse submit(Long eventId, FeedbackRequest request, User student);
    List<FeedbackResponse> getForEvent(Long eventId);
    Double getAverageRating(Long eventId);
}
