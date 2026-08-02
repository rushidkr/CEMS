package com.cems.enums;

public enum EventStatus {
    PENDING,    // awaiting admin approval
    APPROVED,   // approved, visible to students
    REJECTED,   // rejected by admin
    ONGOING,    // currently happening
    COMPLETED,
    CANCELLED
}
