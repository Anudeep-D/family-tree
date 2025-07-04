import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  previousNotificationsState: Notification[] | null;
  canUndo: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  previousNotificationsState: null,
  canUndo: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<{ message: string; link?: string }>) => {
      const newNotification: Notification = {
        id: uuidv4(),
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: action.payload.link,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
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
      }
    },
    undoMarkAllAsRead: state => {
      if (state.previousNotificationsState) {
        state.notifications = state.previousNotificationsState;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        state.previousNotificationsState = null;
        state.canUndo = false;
      }
    },
    clearReadNotifications: state => {
      state.notifications = state.notifications.filter(n => !n.isRead);
    },
    addBackendNotification: (state, action: PayloadAction<Omit<Notification, 'isRead'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        isRead: false,
      };
      if (!state.notifications.find(n => n.id === newNotification.id)) {
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
      }
    },
    // ✅ NEW: Undo single read
    undoRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.isRead) {
        notification.isRead = false;
        state.unreadCount += 1;
      }
    },
    // 🗑️ NEW: Delete a notification completely
    deleteNotification: (state, action: PayloadAction<string>) => {
      const toDelete = state.notifications.find(n => n.id === action.payload);
      if (toDelete) {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        if (!toDelete.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  undoMarkAllAsRead,
  clearReadNotifications,
  addBackendNotification,
  undoRead,                // ✅ Export new action
  deleteNotification       // 🗑️ Export new action
} = notificationSlice.actions;

export default notificationSlice.reducer;
