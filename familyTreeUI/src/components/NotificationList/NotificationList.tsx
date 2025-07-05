import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  // Old actions, will be replaced by thunks
  // markAsRead,
  // undoRead,
  // deleteNotification,
  markAllAsRead, // This is still a local operation as per current slice
  clearReadNotifications, // This is still a local operation
  fetchNotifications, // Thunk to fetch initial notifications
  markNotificationRead, // Thunk for marking as read
  markNotificationUnread, // Thunk for marking as unread
  deleteNotificationThunk, // Thunk for deleting
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
  DraftsTwoTone,
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
    status: notificationStatus,
  } = useSelector((state: RootState) => state.notifications);

  // useEffect(() => {
  //   // Fetch notifications when component mounts if they haven't been fetched or are idle
  //   // You might want to add more sophisticated logic if you only want to fetch once per session
  //   // MOVED: This logic will be moved to a higher-level component for earlier fetching.
  //   // if (notificationStatus === 'idle') {
  //   //   dispatch(fetchNotifications());
  //   // }
  // }, [notificationStatus, dispatch]);

  const [unhoveredIds, setUnhoveredIds] = useState<string[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

  const handleDeleteAll = () => {
    dispatch(clearReadNotifications());
    setConfirmDeleteOpen(false);
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
          <Stack direction="row" spacing={1}>
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={() => dispatch(markAllAsRead())}
                disabled={unreadCount === 0}
              >
                <MarkEmailReadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete all read">
              <IconButton
                size="small"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={read.length === 0}
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
              <DraftsTwoTone fontSize="small" />
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
            // Log details of notification being rendered
            console.log(
              `[NotificationList] Rendering item - ID: ${notification.id}, isRead: ${notification.isRead}, Message: "${notification.message}"`
            );
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
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAll} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NotificationList;
