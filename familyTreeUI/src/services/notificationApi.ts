// This service will handle HTTP API calls related to notifications.
// It's separate from notificationService.ts which handles WebSocket connections.

import { Notification } from '@/redux/notificationSlice'; // Assuming Notification type can be reused

const API_BASE_URL = '/api/notifications';

// Helper to get XSRF token
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  }
  return null;
}

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return headers;
};

export const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to fetch notifications:', response.status, errorBody);
    throw new Error(`Failed to fetch notifications: ${response.status} ${errorBody}`);
  }
  // The backend Notification model might be slightly different from frontend.
  // We need to map it. For now, let's assume they are compatible enough
  // or that the backend will return them in a format the frontend expects
  // (e.g. matching the structure of NotificationEvent for `id`, `message`, `timestamp`)
  // This might need adjustment based on the actual response from GET /api/notifications
  
  const rawResponseText = await response.text(); // Get raw text first
  console.log('[API] Raw response text from /api/notifications:', rawResponseText);

  let backendNotifications: any[];
  try {
    backendNotifications = JSON.parse(rawResponseText);
  } catch (e: any) {
    console.error('[API] Failed to parse JSON response from raw text. Error:', e.message, "Raw text was:", rawResponseText);
    // It's possible the rawResponseText was already an error message and not JSON.
    // The response.ok check should ideally catch server errors, but client-side parsing can also fail.
    throw new Error('Failed to parse notification data from server.');
  }
    
  console.log('[API] Parsed backendNotifications from JSON:', JSON.stringify(backendNotifications, null, 2)); // Log the whole array

  return backendNotifications.map((bn: any, index: number): Notification => {
    // Log the raw item received from backend after JSON parsing
    console.log(`[API] Mapping bn[${index}]:`, JSON.stringify(bn, null, 2)); 
    // Specifically log the status field that will determine isRead
    console.log(`[API] bn[${index}].status (raw from backend object):`, bn.status);

    let detailsMap: Record<string, string> = {};
    if (bn.messagePayload) {
      try {
        const parsedMessagePayload = JSON.parse(bn.messagePayload);
        if (parsedMessagePayload.details && typeof parsedMessagePayload.details === 'object') {
          detailsMap = parsedMessagePayload.details;
        } else if (parsedMessagePayload.error) {
          console.warn(`[API] bn[${index}] (${bn.eventId}) messagePayload contained an error: ${parsedMessagePayload.error}`);
          // Add error to detailsMap to make it visible if NotificationMessage.tsx displays all details
          detailsMap.error = `Payload error: ${parsedMessagePayload.error}`;
        }
      } catch (e: any) {
        console.warn(`[API] bn[${index}] (${bn.eventId}) failed to parse messagePayload JSON: ${e.message}. Payload:`, bn.messagePayload);
        // If messagePayload is critical and unparseable, could set a detail indicating this.
        detailsMap.parsingError = "Could not parse original message payload details.";
      }
    }

    // The message for NotificationMessage.tsx should be the raw JSON string from bn.messagePayload
    // Ensure bn.messagePayload is a string, default to an error JSON string if not.
    let messageForFrontend: string;
    if (typeof bn.messagePayload === 'string' && bn.messagePayload.trim().startsWith('{')) {
      messageForFrontend = bn.messagePayload;
    } else {
      console.warn(`[API] bn[${index}] (${bn.eventId}): messagePayload is not a valid JSON string or is missing. Payload:`, bn.messagePayload);
      // Create a fallback JSON string that NotificationMessage can parse and show an error or minimal info.
      messageForFrontend = JSON.stringify({
        eventType: bn.eventType || "UNKNOWN_EVENT_TYPE_ERROR",
        actorUserName: bn.actorUserName || "Unknown User",
        treeName: bn.treeName || "Unknown Tree",
        details: { error: "Original message payload was invalid or missing.", rawPayload: String(bn.messagePayload).slice(0,100) },
        treeId: bn.treeId || null,
        actorUserId: bn.actorUserId || null,
      });
    }
    console.log(`[API] bn[${index}] (${bn.eventId}) using messagePayload (or fallback JSON string) for Notification.message: "${messageForFrontend}"`);
    
    const isReadStatus = bn.status === 'READ';
    console.log(`[API] bn[${index}] (${bn.eventId}) calculated isRead: ${isReadStatus} (from status: ${bn.status})`);
        
    const finalNotificationObject: Notification = {
        id: bn.eventId,
        message: messageForFrontend, // Pass the JSON string from backend's messagePayload
        timestamp: bn.createdAt,
        isRead: isReadStatus,
        // link: bn.link, 
    };
    // console.log(`[API] bn[${index}] (${bn.eventId}) final frontend object to be stored in Redux:`, JSON.stringify(finalNotificationObject, null, 2));
    return finalNotificationObject;
  });
};

export const markNotificationReadAPI = async (eventId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${eventId}/read`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to mark notification as read:', response.status, errorBody);
    throw new Error(`Failed to mark notification as read: ${response.status} ${errorBody}`);
  }
  // console.log('Successfully marked as read:', await response.text());
};

export const markNotificationUnreadAPI = async (eventId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${eventId}/unread`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to mark notification as unread:', response.status, errorBody);
    throw new Error(`Failed to mark notification as unread: ${response.status} ${errorBody}`);
  }
  // console.log('Successfully marked as unread:', await response.text());
};

export const deleteNotificationAPI = async (eventId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${eventId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to delete notification:', response.status, errorBody);
    throw new Error(`Failed to delete notification: ${response.status} ${errorBody}`);
  }
  // console.log('Successfully deleted:', await response.text());
};

// --- New API functions based on the plan ---

// Mark all notifications as read for the current user
// Expected to return a list of eventIds that were marked as read.
export const markAllNotificationsReadAPI = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/read-all`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to mark all notifications as read:', response.status, errorBody);
    throw new Error(`Failed to mark all notifications as read: ${response.status} ${errorBody}`);
  }
  // The backend controller returns List<String> which is string[] (eventIds)
  return response.json();
};

// Mark a batch of notifications as unread
// eventIds: An array of notification event IDs to mark as unread.
export const markNotificationsUnreadBatchAPI = async (eventIds: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/unread-batch`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(eventIds),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to mark batch of notifications as unread:', response.status, errorBody);
    throw new Error(`Failed to mark batch of notifications as unread: ${response.status} ${errorBody}`);
  }
  // This endpoint returns a confirmation message string or 204 No Content, not JSON.
  // console.log('Successfully marked batch as unread:', await response.text());
};

// Delete all read notifications for the current user
export const clearReadNotificationsAPI = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/read`, { // Note: API_BASE_URL is already /api/notifications
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to delete all read notifications:', response.status, errorBody);
    throw new Error(`Failed to delete all read notifications: ${response.status} ${errorBody}`);
  }
  // This endpoint returns a confirmation message string or 204 No Content.
  // console.log('Successfully cleared read notifications:', await response.text());
};
