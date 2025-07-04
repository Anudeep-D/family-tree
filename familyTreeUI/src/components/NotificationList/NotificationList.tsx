import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  markAsRead,
  markAllAsRead,
  undoRead,
  deleteNotification,
  clearReadNotifications,
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
  const { notifications, unreadCount, canUndo } = useSelector(
    (state: RootState) => state.notifications
  );

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

      <List dense sx={{ maxHeight: 400, overflowY: "auto" }}>
        {visibleNotifications.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
            No notifications to show.
          </Typography>
        ) : (
          visibleNotifications.map((notification) => (
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
                  primaryTypographyProps={{
                    sx: {
                      color: notification.isRead ? "text.secondary" : undefined,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      color: notification.isRead ? "text.disabled" : undefined,
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
                        onClick={() => dispatch(markAsRead(notification.id))}
                      >
                        <MarkEmailReadTwoTone fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Mark as unread" arrow>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(undoRead(notification.id))}
                        >
                          <MarkEmailUnreadTwoTone fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(deleteNotification(notification.id))
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
          ))
        )}
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
