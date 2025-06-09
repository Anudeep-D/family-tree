package dev.anudeep.familytree.utils;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DateTimeUtil {
    public static String toIsoUtcString(Date date) {
        Instant instant = date.toInstant();
        return DateTimeFormatter.ISO_INSTANT.format(instant);
    }

}