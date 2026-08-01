package com.cems.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectEventRequest {

    @NotBlank(message = "A rejection reason is required")
    private String reason;
}
