import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  // Old actions, will be replaced by thunks
  // markAsRead,
  // undoRead,
  // deleteNotification,
  // fetchNotifications, // Assuming this is handled at a higher level as per previous comments
  markNotificationRead, // Thunk for marking as read
  markNotificationUnread, // Thunk for marking as unread
  deleteNotificationThunk, // Thunk for deleting
  // New thunks and actions for bulk operations
  markAllNotificationsRead, // Thunk
  undoMarkAllNotificationsAsRead, // Thunk
  clearReadNotificationsThunk, // Thunk
  markAllAsReadLocalSetup, // Synchronous action for UI state prep
  undoMarkAllAsReadLocalCleanup, // Synchronous action for UI state cleanup
} from "@/redux/notificationSlice";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Switch,
  Stack,
  Fade,
  CircularProgress, // Added for loading state
} from "@mui/material";
import {
  Close as CloseIcon,
  DeleteOutline,
  MarkAsUnreadTwoTone,
  MarkEmailReadTwoTone,
  DeleteSweepTwoTone,
  MarkEmailReadOutlined,
  MarkEmailUnreadTwoTone,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import NotificationMessage from "./NotificationMessage";

interface NotificationListProps {
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    canUndo,
    lastMarkedAllAsReadIds, // Added for the undo functionality
    status: notificationStatus,
  } = useSelector((state: RootState) => state.notifications);

  const [unhoveredIds, setUnhoveredIds] = useState<string[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleMarkAllRead = () => {
    dispatch(markAllAsReadLocalSetup());
    dispatch(markAllNotificationsRead());
  };

  const handleUndoMarkAllRead = () => {
    if (lastMarkedAllAsReadIds && lastMarkedAllAsReadIds.length > 0) {
      dispatch(undoMarkAllNotificationsAsRead(lastMarkedAllAsReadIds))
        .unwrap() // Useful for acting upon promise completion/rejection
        .then(() => {
          dispatch(undoMarkAllAsReadLocalCleanup());
        })
        .catch(() => {
          // Handle potential errors from the thunk, e.g., show a message
          // For now, cleanup is still called to reset UI, but this could be more nuanced
          dispatch(undoMarkAllAsReadLocalCleanup());
          console.error("Failed to undo mark all as read via API.");
        });
    } else {
      // Fallback or if somehow called without IDs, ensure cleanup
      dispatch(undoMarkAllAsReadLocalCleanup());
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);
  const sortedUnread = [...unread].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const sortedRead = [...read].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTimestamp = (timestamp: string): string => {
    try {
      return `${formatDistanceToNow(new Date(timestamp))} ago`;
    } catch {
      return "Invalid date";
    }
  };

  const handleDeleteAllRead = () => {
    dispatch(clearReadNotificationsThunk())
      .unwrap()
      .then(() => {
        setConfirmDeleteOpen(false);
      })
      .catch((error: any) => {
        console.error("Failed to delete all read notifications:", error);
        // Optionally, keep the dialog open or show an error message to the user
        // For now, we'll close it, but the error is logged.
        setConfirmDeleteOpen(false);
      });
  };

  const visibleNotifications = showOnlyUnread
    ? sortedUnread
    : [...sortedUnread, ...sortedRead];

  return (
    <Paper
      sx={{
        width: 400,
        maxWidth: "100%",
        boxShadow: 5,
        p: 1,
        position: "relative",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1}
      >
        <Typography variant="h6">Notifications</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {notifications.length > 0 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          px={1}
          mb={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || notificationStatus === 'loading'}
              >
                <MarkEmailReadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            {canUndo && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleUndoMarkAllRead}
                disabled={notificationStatus === 'loading'}
                sx={{textTransform: 'none', fontSize: '0.75rem', lineHeight: '1.5'}}
              >
                Undo
              </Button>
            )}

            <Tooltip title="Delete all read">
              <IconButton
                size="small"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={read.length === 0 || notificationStatus === 'loading'}
              >
                <DeleteSweepTwoTone fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Show all">
              <MarkAsUnreadTwoTone fontSize="small" />
            </Tooltip>
            <Switch
              size="small"
              checked={showOnlyUnread}
              onChange={() => setShowOnlyUnread((prev) => !prev)}
            />
            <Tooltip title="Only unread">
              <MarkEmailUnreadTwoTone fontSize="small" />
            </Tooltip>
          </Stack>
        </Stack>
      )}

      <List dense sx={{ maxHeight: 400, overflowY: "auto" }}>
        {notificationStatus === "loading" && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ p: 2 }}
          >
            <CircularProgress size={24} />
            <Typography sx={{ ml: 1 }} color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}
        {notificationStatus !== "loading" &&
          visibleNotifications.length === 0 && (
            <Typography
              sx={{ p: 2, textAlign: "center" }}
              color="text.secondary"
            >
              No notifications to show.
            </Typography>
          )}
        {notificationStatus !== "loading" &&
          visibleNotifications.length > 0 &&
          visibleNotifications.map((notification) => {
            return (
              <Fade in key={notification.id} timeout={250}>
                <ListItem
                  divider
                  onMouseEnter={() =>
                    setUnhoveredIds((prev) => [...prev, notification.id])
                  }
                  sx={{
                    position: "relative",
                    pb: 5,
                    backgroundColor:
                      !unhoveredIds.includes(notification.id) &&
                      !notification.isRead
                        ? "action.hover"
                        : "inherit",
                    transition: "background-color 0.2s ease-in-out",
                  }}
                >
                  <ListItemText
                    primary={
                      <NotificationMessage message={notification.message} />
                    }
                    secondary={formatTimestamp(notification.timestamp)}
                    slotProps={{
                      primary: {
                        sx: {
                          color: notification.isRead
                            ? "text.secondary"
                            : undefined,
                        },
                      },
                      secondary: {
                        sx: {
                          color: notification.isRead
                            ? "text.disabled"
                            : undefined,
                        },
                      },
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
                    {!notification.isRead ? (
                      <Tooltip title="Mark as read" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(markNotificationRead(notification.id))
                          }
                        >
                          <MarkEmailReadTwoTone fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Mark as unread" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(markNotificationUnread(notification.id))
                            }
                          >
                            <MarkEmailUnreadTwoTone fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(deleteNotificationThunk(notification.id))
                            }
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </ListItem>
              </Fade>
            );
          })}
      </List>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>
          Are you sure you want to delete all read notifications?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={notificationStatus === 'loading'}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAllRead} autoFocus disabled={notificationStatus === 'loading'}>
            {notificationStatus === 'loading' ? <CircularProgress size={20}/> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NotificationList;
