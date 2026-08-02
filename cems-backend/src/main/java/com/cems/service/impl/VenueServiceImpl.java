package com.cems.service.impl;

import com.cems.dto.request.VenueRequest;
import com.cems.dto.response.VenueResponse;
import com.cems.entity.Venue;
import com.cems.exception.ResourceNotFoundException;
import com.cems.repository.VenueRepository;
import com.cems.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    @Override
    @Transactional
    public VenueResponse create(VenueRequest request) {
        Venue venue = Venue.builder()
                .name(request.getName())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .facilities(request.getFacilities())
                .active(true)
                .build();
        return toResponse(venueRepository.save(venue));
    }

    @Override
    @Transactional
    public VenueResponse update(Long id, VenueRequest request) {
        Venue venue = getVenueOrThrow(id);
        venue.setName(request.getName());
        venue.setLocation(request.getLocation());
        venue.setCapacity(request.getCapacity());
        venue.setFacilities(request.getFacilities());
        return toResponse(venueRepository.save(venue));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Venue venue = getVenueOrThrow(id);
        venue.setActive(false);
        venueRepository.save(venue);
    }

    @Override
    public VenueResponse getById(Long id) {
        return toResponse(getVenueOrThrow(id));
    }

    @Override
    public List<VenueResponse> getAllActive() {
        return venueRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Override
    public List<VenueResponse> getAvailable(LocalDateTime start, LocalDateTime end) {
        return venueRepository.findAvailableVenues(start, end).stream().map(this::toResponse).toList();
    }

    private Venue getVenueOrThrow(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
    }

    private VenueResponse toResponse(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .location(venue.getLocation())
                .capacity(venue.getCapacity())
                .facilities(venue.getFacilities())
                .active(venue.isActive())
                .build();
    }
}
