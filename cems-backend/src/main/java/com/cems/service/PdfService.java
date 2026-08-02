package com.cems.service;

import com.cems.entity.Event;
import com.cems.entity.Registration;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface PdfService {
    ByteArrayInputStream generateAttendeeRosterPdf(Event event, List<Registration> registrations);
    ByteArrayInputStream generateRegistrationTicketPdf(Registration registration);
}
