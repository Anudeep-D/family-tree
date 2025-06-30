import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for notifications

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO string for date and time
  isRead: boolean;
  link?: string; // Optional link to navigate to
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  previousNotificationsState: Notification[] | null; // For undo functionality
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
      state.notifications.unshift(newNotification); // Add to the beginning for latest first
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => { // Payload is notification ID
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: state => {
      if (state.notifications.some(n => !n.isRead)) {
        state.previousNotificationsState = JSON.parse(JSON.stringify(state.notifications)); // Deep copy
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
      // This action will remove notifications that are marked as read.
      // The request implies read notifications are "cleared" when the list is closed and opened.
      // This could be handled by filtering in the component, or by actually removing them from state.
      // For now, let's implement it as removing them from the state.
      // However, this might conflict with "undo" if not handled carefully.
      // Alternative: simply filter in the component that displays notifications.
      // Let's assume for now "cleared" means they are no longer actively shown in the "unread" list,
      // which is achieved by marking them read and filtering in the component.
      // If actual removal is needed, this reducer can be used.
      // For now, this reducer might not be directly used if filtering is preferred.
      state.notifications = state.notifications.filter(n => !n.isRead);
    },
    // Example for a notification that comes with its own ID and timestamp from backend
    addBackendNotification: (state, action: PayloadAction<Omit<Notification, 'isRead'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        isRead: false,
      };
      // Prevent duplicate notifications if IDs are stable from backend
      if (!state.notifications.find(n => n.id === newNotification.id)) {
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
      }
    }
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  undoMarkAllAsRead,
  clearReadNotifications,
  addBackendNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
