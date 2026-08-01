package com.cems.repository;

import com.cems.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByActiveTrue();

    /**
     * Returns all active venues that do NOT have an approved/ongoing event
     * overlapping the given [start, end) window. Used to prevent double-booking.
     */
    @Query("""
           SELECT v FROM Venue v
           WHERE v.active = true
           AND v.id NOT IN (
               SELECT e.venue.id FROM Event e
               WHERE e.status IN ('PENDING', 'APPROVED', 'ONGOING')
               AND e.startTime < :end
               AND e.endTime > :start
           )
           """)
    List<Venue> findAvailableVenues(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Same as findAvailableVenues, but excludes one event's own existing booking from the
     * conflict check - used when updating an event so it doesn't collide with itself.
     */
    @Query("""
           SELECT v FROM Venue v
           WHERE v.active = true
           AND v.id NOT IN (
               SELECT e.venue.id FROM Event e
               WHERE e.status IN ('PENDING', 'APPROVED', 'ONGOING')
               AND e.id <> :excludeEventId
               AND e.startTime < :end
               AND e.endTime > :start
           )
           """)
    List<Venue> findAvailableVenuesExcludingEvent(@Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end,
                                                     @Param("excludeEventId") Long excludeEventId);
}
