package com.cems.repository;

import com.cems.entity.Registration;
import com.cems.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Page<Registration> findByStudentId(Long studentId, Pageable pageable);

    List<Registration> findByEventId(Long eventId);

    Optional<Registration> findByEventIdAndStudentId(Long eventId, Long studentId);

    boolean existsByEventIdAndStudentId(Long eventId, Long studentId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<Registration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);

    long countByStatus(RegistrationStatus status);
}
