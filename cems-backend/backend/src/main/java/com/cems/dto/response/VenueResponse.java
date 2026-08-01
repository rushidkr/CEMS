package com.cems.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VenueResponse {
    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String facilities;
    private boolean active;
}
