package dev.anudeep.familytree.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {
    private DateTimeUtil() {
    }

    public static String toIsoUtcString(String date) {
        Instant instant = Instant.parse(date);
        return DateTimeFormatter.ISO_INSTANT.format(instant);
    }

    public static String readableDate(String date) {
        Instant instant = Instant.parse(date);

        // Choose your desired time zone (e.g., Asia/Kolkata)
        ZoneId zoneId = ZoneId.systemDefault();

        ZonedDateTime zonedDateTime = instant.atZone(zoneId);

        // Format as: "09 Jun 2025, 01:27 PM"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return formatter.format(zonedDateTime);
    }

}