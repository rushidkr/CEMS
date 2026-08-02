package com.cems.config;

import com.cems.entity.Event;
import com.cems.entity.User;
import com.cems.entity.Venue;
import com.cems.enums.EventStatus;
import com.cems.enums.Role;
import com.cems.repository.EventRepository;
import com.cems.repository.UserRepository;
import com.cems.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial database data...");

            User admin = userRepository.save(User.builder()
                    .fullName("System Admin")
                    .email("admin@cems.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("1234567890")
                    .department("Administration")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build());

            User organizer = userRepository.save(User.builder()
                    .fullName("Alex Organizer")
                    .email("organizer@cems.edu")
                    .password(passwordEncoder.encode("Organizer@123"))
                    .phone("9876543210")
                    .department("Computer Science")
                    .role(Role.ORGANIZER)
                    .enabled(true)
                    .build());

            User student = userRepository.save(User.builder()
                    .fullName("Jordan Student")
                    .email("student@cems.edu")
                    .password(passwordEncoder.encode("Student@123"))
                    .phone("5551234567")
                    .department("Software Engineering")
                    .role(Role.STUDENT)
                    .enabled(true)
                    .build());

            Venue mainAuditorium = venueRepository.save(Venue.builder()
                    .name("Main Auditorium")
                    .location("Central Block - 1st Floor")
                    .capacity(500)
                    .facilities("Projector, Sound System, Stage Lighting, AC")
                    .active(true)
                    .build());

            Venue seminarHall = venueRepository.save(Venue.builder()
                    .name("Seminar Hall A")
                    .location("Academic Block B - 3rd Floor")
                    .capacity(150)
                    .facilities("Smart Board, Wireless Mikes, High Speed Wi-Fi")
                    .active(true)
                    .build());

            Venue sportsComplex = venueRepository.save(Venue.builder()
                    .name("Campus Sports Complex")
                    .location("East Campus Grounds")
                    .capacity(1000)
                    .facilities("Indoor Arena, Bleachers, Floodlights, Scoreboard")
                    .active(true)
                    .build());

            Venue techLab = venueRepository.save(Venue.builder()
                    .name("Tech Innovation Lab")
                    .location("Engineering Block - Room 204")
                    .capacity(60)
                    .facilities("Dual Monitors, High Performance Workstations, VR Kits")
                    .active(true)
                    .build());

            LocalDateTime now = LocalDateTime.now();

            eventRepository.save(Event.builder()
                    .title("Annual Tech Symposium 2026")
                    .description("Join key industry leaders and student innovators for keynotes, paper presentations, and tech demos.")
                    .category("Technical")
                    .venue(mainAuditorium)
                    .organizer(organizer)
                    .startTime(now.plusDays(7).withHour(10).withMinute(0))
                    .endTime(now.plusDays(7).withHour(17).withMinute(0))
                    .registrationDeadline(now.plusDays(5))
                    .capacity(400)
                    .status(EventStatus.APPROVED)
                    .build());

            eventRepository.save(Event.builder()
                    .title("Campus Cultural Fest: Harmony")
                    .description("A vibrant celebration of music, dance, theater, and art performances by students across all departments.")
                    .category("Cultural")
                    .venue(sportsComplex)
                    .organizer(organizer)
                    .startTime(now.plusDays(14).withHour(16).withMinute(0))
                    .endTime(now.plusDays(14).withHour(22).withMinute(0))
                    .registrationDeadline(now.plusDays(12))
                    .capacity(800)
                    .status(EventStatus.APPROVED)
                    .build());

            eventRepository.save(Event.builder()
                    .title("AI & Machine Learning Hands-on Workshop")
                    .description("Interactive workshop covering LLM fine-tuning, neural networks, and modern AI application deployment.")
                    .category("Workshop")
                    .venue(techLab)
                    .organizer(organizer)
                    .startTime(now.plusDays(3).withHour(14).withMinute(0))
                    .endTime(now.plusDays(3).withHour(18).withMinute(0))
                    .registrationDeadline(now.plusDays(2))
                    .capacity(50)
                    .status(EventStatus.APPROVED)
                    .build());

            eventRepository.save(Event.builder()
                    .title("Inter-College Hackathon 2026")
                    .description("24-hour coding marathon to solve real-world sustainability and campus challenges.")
                    .category("Technical")
                    .venue(seminarHall)
                    .organizer(organizer)
                    .startTime(now.plusDays(20).withHour(9).withMinute(0))
                    .endTime(now.plusDays(21).withHour(9).withMinute(0))
                    .registrationDeadline(now.plusDays(18))
                    .capacity(120)
                    .status(EventStatus.PENDING)
                    .build());

            log.info("Database seeding completed successfully.");
        }
    }
}
