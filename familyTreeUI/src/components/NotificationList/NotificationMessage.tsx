import React from "react";
import { Box, Typography } from "@mui/material";

interface NotificationMessageProps {
  message: string; // stringified JSON from the backend
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({ message }) => {
  try {
    const data = JSON.parse(message);

    const {
      actorUserName,
      eventType,
      treeName,
      details,
    }: {
      actorUserName: string;
      eventType: string;
      treeName: string;
      details?: Record<string, string>;
    } = data;

    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {eventType}
        </Typography>
        <Typography variant="body2">
          by <strong>{actorUserName}</strong> on <strong>{treeName}</strong>
        </Typography>
        {details && Object.keys(details).length > 0 && (
          <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0, fontSize: "0.85rem" }}>
            {Object.entries(details).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </Box>
        )}
      </Box>
    );
  } catch (e) {
    // This is where the "Invalid notification format" message originates
    // if the message prop is not a valid JSON string matching the expected structure.
    console.error("Error parsing notification message JSON:", e, "Raw message was:", message);
    return (
      <Typography variant="body2" color="error">
        Invalid notification format
      </Typography>
    );
  }
};

export default NotificationMessage;
