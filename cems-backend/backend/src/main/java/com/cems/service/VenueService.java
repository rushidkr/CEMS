package com.cems.service;

import com.cems.dto.request.VenueRequest;
import com.cems.dto.response.VenueResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface VenueService {
    VenueResponse create(VenueRequest request);
    VenueResponse update(Long id, VenueRequest request);
    void deactivate(Long id);
    VenueResponse getById(Long id);
    List<VenueResponse> getAllActive();
    List<VenueResponse> getAvailable(LocalDateTime start, LocalDateTime end);
}
