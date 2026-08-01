package com.cems.repository;

import com.cems.entity.Event;
import com.cems.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);

    long countByStatus(EventStatus status);

    @Query("""
           SELECT e FROM Event e
           WHERE e.status = 'APPROVED'
           AND e.endTime >= :now
           AND (:category IS NULL OR LOWER(e.category) = LOWER(:category))
           AND (:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
           ORDER BY e.startTime ASC
           """)
    Page<Event> searchUpcoming(@Param("category") String category,
                                @Param("keyword") String keyword,
                                @Param("now") LocalDateTime now,
                                Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.status = 'APPROVED' AND e.startTime BETWEEN :now AND :window")
    List<Event> findEventsStartingSoon(@Param("now") LocalDateTime now, @Param("window") LocalDateTime window);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.startTime BETWEEN :start AND :end")
    long countEventsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Event> findByStatusAndEndTimeBefore(EventStatus status, LocalDateTime now);
}

