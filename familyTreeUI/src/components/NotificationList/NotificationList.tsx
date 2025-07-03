import React, { useEffect } from "react"; // Added useEffect
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  Notification,
  markAsRead, // We'll call this when a notification is viewed
  markAllAsRead,
  undoMarkAllAsRead,
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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns"; // For user-friendly timestamps

interface NotificationListProps {
  anchorEl: HTMLElement | null; // Needed for Popover positioning
  onClose: () => void; // Callback to close the list
}

const NotificationList: React.FC<NotificationListProps> = ({
  anchorEl,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { notifications, unreadCount, canUndo } = useSelector(
    (state: RootState) => state.notifications
  );
  console.log("notifications",notifications);
  // Filter for unread notifications to display, or all if that's the requirement
  // The original request: "when clicked show the list of all unread messages"
  // "when user closes and opens again all read notifications are cleared"
  // This implies we primarily show unread, and read ones are implicitly cleared from this view.
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleUndoMarkAllAsRead = () => {
    dispatch(undoMarkAllAsRead());
  };

  // For now, let's sort by timestamp client-side. Backend should ideally send them sorted.
  const sortedUnreadNotifications = [...unreadNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const sortedReadNotifications = [...readNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // This function will be called when a notification item is "seen"
  // For simplicity, we might call this when the list is opened,
  // or more accurately with IntersectionObserver for each item.
  // Let's start by marking items as read when they are rendered in this list.

  // Mark notifications as read when they become visible
  useEffect(() => {
    // Check if anchorEl is not null, meaning the popover is open
    if (anchorEl) {
      sortedUnreadNotifications.forEach((notification) => {
        // Check if it's still unread before dispatching, though slice reducer also checks
        if (!notification.isRead) {
          dispatch(markAsRead(notification.id));
        }
      });
    }
    // Dependency: sortedUnreadNotifications array. If it changes (new unread notifs arrive while open),
    // this effect will re-run. We also depend on `dispatch` and `anchorEl` to ensure it runs when popover opens.
  }, [sortedUnreadNotifications, dispatch, anchorEl]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      return `${formatDistanceToNow(new Date(timestamp))} ago`;
    } catch (error) {
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
        <Typography variant="h6" component="div">
          Notifications
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 1 }} />

      {(unreadCount > 0 || canUndo) && ( // Show this section if there are unread messages OR if undo is possible
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
            onClick={handleMarkAllAsRead}
            size="small"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button
            onClick={handleUndoMarkAllAsRead}
            size="small"
            disabled={!canUndo}
          >
            Undo
          </Button>
        </Box>
      )}

      {notifications.length === 0 && ( // Check total notifications length for this message
        <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
          No new notifications.
        </Typography>
      )}

      <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
        {/* Display this message if there are no unread notifications AND no read notifications to show (if we were showing them) */}
        {/* This message is now slightly different: it shows if the overall notifications array is empty.
          If there are read notifications, but no unread, this message won't show, but the list of unread will be empty.
          This seems more correct.
       */}
        {notifications.length > 0 &&
          unreadNotifications.length === 0 &&
          !canUndo && (
            <Typography
              sx={{ p: 2, textAlign: "center" }}
              color="text.secondary"
            >
              All notifications read.
            </Typography>
          )}
        {sortedUnreadNotifications.map((notification) => (
          <ListItem
            key={notification.id}
            divider
            sx={{ backgroundColor: "action.hover" }} // Highlight unread
            // onClick={() => dispatch(markAsRead(notification.id))} // Example if clicking marks as read
          >
            <ListItemText
              primary={notification.message}
              secondary={formatTimestamp(notification.timestamp)}
            />
            {/* Add an optional link or action button here if needed */}
          </ListItem>
        ))}
        {/* Optionally, display read notifications differently or not at all */}
        {/* For now, focusing on unread as per primary requirement */}
        {/* If we want to show read notifications after unread ones: */}
        {/* {sortedReadNotifications.length > 0 && unreadNotifications.length > 0 && <Divider sx={{my: 1}}><Typography variant="caption">Read</Typography></Divider>}
        {sortedReadNotifications.map(notification => (
          <ListItem key={notification.id} divider>
            <ListItemText
              primary={notification.message}
              secondary={formatTimestamp(notification.timestamp)}
              primaryTypographyProps={{ sx: { color: 'text.secondary' } }}
              secondaryTypographyProps={{ sx: { color: 'text.disabled' } }}
            />
          </ListItem>
        ))} */}
      </List>
    </Paper>
  );
};

export default NotificationList;
