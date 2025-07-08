import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchNotificationsAPI,
  markNotificationReadAPI,
  markNotificationUnreadAPI,
  deleteNotificationAPI,
  markAllNotificationsReadAPI,
  markNotificationsUnreadBatchAPI,
  clearReadNotificationsAPI,
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
  lastMarkedAllAsReadIds: string[] | null; // Store IDs affected by the last "mark all as read"
  canUndo: boolean; // For undo mark all as read
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  previousNotificationsState: null,
  lastMarkedAllAsReadIds: null,
  canUndo: false,
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await fetchNotificationsAPI();
      return notifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk<string, string, { rejectValue: string }>(
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

export const markNotificationUnread = createAsyncThunk<string, string, { rejectValue: string }>(
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

export const deleteNotificationThunk = createAsyncThunk<string, string, { rejectValue: string }>(
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

// New Thunk for marking all notifications as read
export const markAllNotificationsRead = createAsyncThunk<string[], void, { rejectValue: string; state: { notifications: NotificationState } }>(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Optionally, capture state *before* API call if needed for optimistic updates or complex rollbacks
      // const { notifications } = getState().notifications;
      const updatedEventIds = await markAllNotificationsReadAPI();
      return updatedEventIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

// New Thunk for undoing mark all as read (by marking a batch as unread)
export const undoMarkAllNotificationsAsRead = createAsyncThunk<string[], string[], { rejectValue: string }>(
  'notifications/undoMarkAllNotificationsAsRead',
  async (eventIdsToUnread: string[], { rejectWithValue }) => {
    if (!eventIdsToUnread || eventIdsToUnread.length === 0) {
      return rejectWithValue('No notification IDs provided to unread.');
    }
    try {
      await markNotificationsUnreadBatchAPI(eventIdsToUnread);
      return eventIdsToUnread; // Return the IDs that were intended to be marked unread
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to batch mark notifications as unread');
    }
  }
);

// New Thunk for clearing all read notifications
export const clearReadNotificationsThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'notifications/clearReadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await clearReadNotificationsAPI();
      // No specific data needed on success, the reducer will filter local state
      return;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear read notifications');
    }
  }
);


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
    addBackendNotification: (state, action: PayloadAction<Notification>) => {
        const existingNotification = state.notifications.find(n => n.id === action.payload.id);
        if (!existingNotification) {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.status = 'succeeded';
    },
    // Dispatcher for markAllNotificationsRead thunk
    // UI components will call this action creator.
    // The actual logic is now in the thunk and its extraReducers.
    // This reducer primarily handles the setup for 'undo' capability.
    prepareMarkAllAsRead: state => {
      if (state.notifications.some(n => !n.isRead)) {
        // Store current state for potential local undo (though server undo is preferred)
        state.previousNotificationsState = JSON.parse(JSON.stringify(state.notifications));
        state.canUndo = true; // Enable undo button
        // The actual marking as read and API call will be done by the thunk
        // dispatched by the component that calls this action.
        // Or, this action itself could dispatch the thunk if that's a preferred pattern.
        // For now, let UI dispatch the thunk after calling this.
      }
    },
    // Dispatcher for undoMarkAllNotificationsAsRead thunk
    // Similar to prepareMarkAllAsRead, UI calls this, then dispatches the thunk.
    prepareUndoMarkAllAsRead: state => {
      // This reducer mostly manages the 'canUndo' state locally.
      // The actual restoration of 'isRead' status is handled by the thunk.
      if (state.canUndo && state.lastMarkedAllAsReadIds) {
        // Logic to revert is in the thunk. Here we just clear the undo flags.
        // state.canUndo = false; // This should be set after thunk success/failure
        // state.previousNotificationsState = null; // Also after thunk
        // state.lastMarkedAllAsReadIds = null; // Also after thunk
      }
    },
    // Dispatcher for clearReadNotificationsThunk
    // UI components will call this action creator, then dispatch the thunk.
    prepareClearReadNotifications: state => {
        // No local state change needed before dispatching the thunk
        // The thunk will handle API call and then its extraReducer updates the state.
    },
    // Reducer to be called when the markAllNotificationsRead thunk is PENDING
    // This is where we can set the local state optimistically or prepare for undo.
    // This is an alternative to the prepareMarkAllAsRead synchronous reducer.
    // Let's use the synchronous reducer `markAllAsReadLocalSetup` for now.

    // Synchronous reducer for 'markAllAsRead' logic that was previously in `markAllAsRead`
    // This will now be called by a component, which then dispatches `markAllNotificationsRead` thunk
    markAllAsReadLocalSetup: (state) => {
      if (state.notifications.some(notification => !notification.isRead)) {
        state.previousNotificationsState = JSON.parse(JSON.stringify(state.notifications));
        // state.lastMarkedAllAsReadIds = null; // Thunk will set this on fulfillment
        state.canUndo = true; // Enable undo immediately
      }
    },
    // Synchronous reducer for 'undoMarkAllAsRead' logic
    // Component calls this, then dispatches `undoMarkAllNotificationsAsRead` thunk
    undoMarkAllAsReadLocalCleanup: (state) => {
      // This is mostly for resetting UI flags after thunk.
      // The actual data change is in the thunk's extraReducer.
      state.canUndo = false;
      state.previousNotificationsState = null;
      state.lastMarkedAllAsReadIds = null;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        const newNotifications = action.payload;
        const existingIds = new Set(state.notifications.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
        
        state.notifications = [...uniqueNewNotifications, ...state.notifications]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
         
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
      // --- Extra reducers for new thunks ---
      .addCase(markAllNotificationsRead.pending, (state) => {
        // Optional: set a specific loading status for this operation
        // state.status = 'loading'; // Can be more granular if needed
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action: PayloadAction<string[]>) => {
        const updatedEventIds = action.payload;
        updatedEventIds.forEach(eventId => {
          const notification = state.notifications.find(n => n.id === eventId);
          if (notification && !notification.isRead) {
            notification.isRead = true;
          }
        });
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        state.lastMarkedAllAsReadIds = updatedEventIds; // Store for undo
        // state.canUndo is already set by `markAllAsReadLocalSetup`
        state.status = 'succeeded';
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        state.canUndo = false; // Disable undo if API call failed
        state.previousNotificationsState = null; // Clear previous state as it's no longer relevant for this failed attempt
      })
      .addCase(undoMarkAllNotificationsAsRead.fulfilled, (state, action: PayloadAction<string[]>) => {
        const unreadEventIds = action.payload;
        unreadEventIds.forEach(eventId => {
          const notification = state.notifications.find(n => n.id === eventId);
          if (notification && notification.isRead) {
            notification.isRead = false;
          }
        });
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        // Cleanup is done by `undoMarkAllAsReadLocalCleanup` dispatched by UI after this thunk
        state.status = 'succeeded';
      })
      .addCase(undoMarkAllNotificationsAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
        // UI should handle this error, canUndo might still be true if user wants to retry local part
        // Or, reset canUndo here if the server operation is critical for the undo to make sense
        // For now, let `undoMarkAllAsReadLocalCleanup` handle resetting canUndo.
      })
      .addCase(clearReadNotificationsThunk.pending, (state) => {
        // Optional: set loading status
      })
      .addCase(clearReadNotificationsThunk.fulfilled, (state) => {
        const readNotificationsIds = state.notifications
          .filter(n => n.isRead)
          .map(n => n.id);
        
        state.notifications = state.notifications.filter(n => !n.isRead);
        // unreadCount should remain the same as we only deleted read ones.
        // No change to canUndo or previousNotificationsState from this operation.
        state.status = 'succeeded';
      })
      .addCase(clearReadNotificationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Optional: Handle rejected states for specific single-item thunks if needed for UI feedback
      .addCase(markNotificationRead.rejected, (state, action) => {
        console.error("Failed to mark notification as read:", action.payload || action.error.message);
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
  addNotification,
  addBackendNotification,
  setNotifications,
  // The following are now primarily for local state setup/cleanup before/after thunks
  // Components will dispatch these, then the corresponding thunk.
  markAllAsReadLocalSetup,      // Renamed from prepareMarkAllAsRead for clarity
  undoMarkAllAsReadLocalCleanup,  // Renamed from prepareUndoMarkAllAsRead
  prepareClearReadNotifications // This one can remain as is, or be removed if thunk is dispatched directly
} = notificationSlice.actions;

export default notificationSlice.reducer;
