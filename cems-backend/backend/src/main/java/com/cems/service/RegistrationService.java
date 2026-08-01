package com.cems.service;

import com.cems.dto.response.RegistrationResponse;
import com.cems.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RegistrationService {
    RegistrationResponse register(Long eventId, User student);
    void cancel(Long eventId, User student);
    RegistrationResponse checkIn(Long eventId, Long studentId, User requester);
    Page<RegistrationResponse> getForStudent(Long studentId, Pageable pageable);
    java.util.List<RegistrationResponse> getForEvent(Long eventId);
}
