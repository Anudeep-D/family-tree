import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchNotificationsAPI,
  markNotificationReadAPI,
  markNotificationUnreadAPI,
  deleteNotificationAPI,
} from '@/services/notificationApi'; // Adjust path as necessary

export interface Notification {
  id: string; // Corresponds to eventId from backend
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  previousNotificationsState: Notification[] | null; // For undo mark all as read
  canUndo: boolean; // For undo mark all as read
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  previousNotificationsState: null,
  canUndo: false,
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async () => {
  const response = await fetchNotificationsAPI();
  return response; // This will be Notification[]
});

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await markNotificationReadAPI(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationUnread = createAsyncThunk(
  'notifications/markNotificationUnread',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await markNotificationUnreadAPI(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await deleteNotificationAPI(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // For client-side generated notifications (e.g., local alerts not from backend)
    addNotification: (state, action: PayloadAction<{ message: string; link?: string }>) => {
      const newNotification: Notification = {
        id: uuidv4(), // Client-generated ID
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: action.payload.link,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    // Action to add a notification received from backend (e.g. via WebSocket)
    // This assumes the backend notification object matches the frontend `Notification` type or is transformed before dispatch.
    // Specifically, `id` should be the `eventId`.
    addBackendNotification: (state, action: PayloadAction<Notification>) => {
        // Check if notification already exists to prevent duplicates from WS + initial fetch
        const existingNotification = state.notifications.find(n => n.id === action.payload.id);
        if (!existingNotification) {
            state.notifications.unshift(action.payload); // Add to the beginning of the list
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        } else {
            // Optionally update existing notification if payload has newer info, though usually not needed for new items.
            // For now, we just ignore if it's a duplicate ID.
            // If it was an update (e.g. read status change from another client), we might handle it differently.
        }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.status = 'succeeded';
    },
    // Handles marking all as read locally. API call for this would be a separate thunk if needed.
    markAllAsRead: state => {
      if (state.notifications.some(n => !n.isRead)) {
        state.previousNotificationsState = JSON.parse(JSON.stringify(state.notifications));
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
          }
        });
        state.unreadCount = 0;
        state.canUndo = true;
        // TODO: Consider if `markAllAsRead` should also call an API.
        // For now, it's a local operation. If it needs to be persisted,
        // a `markAllNotificationsRead` thunk would be needed.
      }
    },
    undoMarkAllAsRead: state => {
      if (state.previousNotificationsState) {
        state.notifications = state.previousNotificationsState;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        state.previousNotificationsState = null;
        state.canUndo = false;
        // TODO: If `markAllAsRead` calls an API, this might need to revert those changes too.
      }
    },
    // Handles clearing read notifications locally. API call for this would be a separate thunk.
    clearReadNotifications: state => {
      const readNotifications = state.notifications.filter(n => n.isRead);
      state.notifications = state.notifications.filter(n => !n.isRead);
      // TODO: If `clearReadNotifications` should persist, a `deleteMultipleNotifications` thunk
      // would be needed, taking IDs of read notifications.
      // This is a potentially destructive operation if not confirmed or handled carefully on backend.
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        // state.status = 'succeeded'; // Moved to setNotifications reducer
        // Merging fetched notifications with existing ones to avoid duplicates if WS already added some.
        // A more sophisticated merge might be needed based on timestamps if order is critical
        // and WS could deliver out of order with HTTP fetch.
        // For simplicity, let's replace and recalculate unread count.
        // If `addBackendNotification` is robust, it can handle duplicates.
        const newNotifications = action.payload;
        const existingIds = new Set(state.notifications.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
        
        state.notifications = [...uniqueNewNotifications, ...state.notifications]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Ensure sorted
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        state.status = 'succeeded';

      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(markNotificationRead.fulfilled, (state, action: PayloadAction<string>) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationUnread.fulfilled, (state, action: PayloadAction<string>) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && notification.isRead) {
          notification.isRead = false;
          state.unreadCount += 1;
        }
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action: PayloadAction<string>) => {
        const notificationId = action.payload;
        const toDelete = state.notifications.find(n => n.id === notificationId);
        if (toDelete) {
          if (!toDelete.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications = state.notifications.filter(n => n.id !== notificationId);
        }
      })
      // Optional: Handle rejected states for specific thunks if needed for UI feedback
      .addCase(markNotificationRead.rejected, (state, action) => {
        console.error("Failed to mark notification as read:", action.payload || action.error.message);
        // Optionally revert optimistic update or show error to user
      })
      .addCase(markNotificationUnread.rejected, (state, action) => {
        console.error("Failed to mark notification as unread:", action.payload || action.error.message);
      })
      .addCase(deleteNotificationThunk.rejected, (state, action) => {
        console.error("Failed to delete notification:", action.payload || action.error.message);
      });
  },
});

export const {
  addNotification, // For client-side only notifications
  addBackendNotification, // For notifications from WebSocket
  setNotifications, // For setting all notifications from API
  markAllAsRead, // Local operation
  undoMarkAllAsRead, // Local operation
  clearReadNotifications, // Local operation
} = notificationSlice.actions;

// Old action names are now thunks, so we don't export them from notificationSlice.actions directly.
// Components will dispatch the thunks: `markNotificationRead`, `markNotificationUnread`, `deleteNotificationThunk`.

export default notificationSlice.reducer;
