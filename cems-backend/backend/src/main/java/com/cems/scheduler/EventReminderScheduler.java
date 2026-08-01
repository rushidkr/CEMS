package com.cems.scheduler;

import com.cems.entity.Event;
import com.cems.enums.EventStatus;
import com.cems.repository.EventRepository;
import com.cems.service.EventService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class EventReminderScheduler {

    private final EventService eventService;
    private final EventRepository eventRepository;

    public EventReminderScheduler(EventService eventService, EventRepository eventRepository) {
        this.eventService = eventService;
        this.eventRepository = eventRepository;
    }

    // Runs every hour, on the hour
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminders() {
        eventService.sendRemindersForUpcomingEvents();
    }

    // Runs every 15 minutes to mark past approved events as COMPLETED
    @Scheduled(cron = "0 */15 * * * *")
    public void autoUpdateCompletedEvents() {
        List<Event> pastEvents = eventRepository.findByStatusAndEndTimeBefore(EventStatus.APPROVED, LocalDateTime.now());
        if (!pastEvents.isEmpty()) {
            for (Event e : pastEvents) {
                e.setStatus(EventStatus.COMPLETED);
            }
            eventRepository.saveAll(pastEvents);
            log.info("Auto-completed {} past approved events.", pastEvents.size());
        }
    }
}

