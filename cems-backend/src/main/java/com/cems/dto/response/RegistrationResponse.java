package com.cems.dto.response;

import com.cems.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long studentId;
    private String studentName;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime checkedInAt;
}
