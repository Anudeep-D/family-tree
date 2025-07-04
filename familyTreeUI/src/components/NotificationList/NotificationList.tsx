import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  markAsRead,
  markAllAsRead,
  undoMarkAllAsRead,
  undoRead,
  deleteNotification,
} from "@/redux/notificationSlice";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Box,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  DeleteOutline,
  MarkAsUnreadTwoTone,
  MarkEmailReadTwoTone,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

interface NotificationListProps {
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const { notifications, unreadCount, canUndo } = useSelector(
    (state: RootState) => state.notifications
  );

  const [unhoveredIds, setUnhoveredIds] = useState<string[]>([]);

  const sortedUnread = [...notifications.filter((n) => !n.isRead)].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const sortedRead = [...notifications.filter((n) => n.isRead)].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTimestamp = (timestamp: string): string => {
    try {
      return `${formatDistanceToNow(new Date(timestamp))} ago`;
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Paper sx={{ width: 360, maxWidth: "100%", boxShadow: 5, p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
        }}
      >
        <Typography variant="h6">Notifications</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {notifications.length === 0 && ( // Check total notifications length for this message
        <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
          No new notifications.
        </Typography>
      )}
      {(unreadCount > 0 || canUndo) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            mb: 1,
          }}
        >
          <Button
            onClick={() => dispatch(markAllAsRead())}
            size="small"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button
            onClick={() => dispatch(undoMarkAllAsRead())}
            size="small"
            disabled={!canUndo}
          >
            Undo
          </Button>
        </Box>
      )}

      <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
        {sortedUnread.map((notification) => (
          <ListItem
            key={notification.id}
            divider
            onMouseEnter={() =>
              setUnhoveredIds((prev) => [...prev, notification.id])
            }
            sx={{
              position: "relative",
              pb: 5, // padding bottom to accommodate action buttons
              backgroundColor: !unhoveredIds.includes(notification.id)
                ? "action.hover"
                : "inherit",
              transition: "background-color 0.2s",
            }}
          >
            <ListItemText
              primary={notification.message}
              secondary={formatTimestamp(notification.timestamp)}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
              }}
            >
              <Tooltip title="Mark as read" arrow>
                <IconButton
                  size="small"
                  onClick={() => dispatch(markAsRead(notification.id))}
                >
                  <MarkEmailReadTwoTone fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}

        {sortedRead.map((notification) => (
          <ListItem key={notification.id} divider>
            <ListItemText
              primary={notification.message}
              secondary={formatTimestamp(notification.timestamp)}
              slotProps={{
                primary: { sx: { color: "text.secondary" } },
                secondary: { sx: { color: "text.disabled" } },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                display: "flex",
                gap: 1,
              }}
            >
              <Tooltip title="Mark as unread" arrow>
                <IconButton
                  size="small"
                  onClick={() => dispatch(undoRead(notification.id))}
                >
                  <MarkAsUnreadTwoTone fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="delete" arrow>
                <IconButton
                  size="small"
                  onClick={() => dispatch(deleteNotification(notification.id))}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationList;
