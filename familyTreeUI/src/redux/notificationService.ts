import { CompatClient, Stomp, Frame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Store } from '@reduxjs/toolkit';
import { addBackendNotification, addNotification } from './notificationSlice';
import { RootState } from '@/app/store';

const SOCKET_URL = '/api/ws';
const USER_SPECIFIC_TOPIC = '/user/queue/notifications';

let stompClient: CompatClient | null = null;
let storeInstance: Store<RootState> | null = null;

export const initNotificationService = (store: Store<RootState>) => {
  storeInstance = store;
};

// Helper function to get a cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  }
  return null;
}

const connect = (authToken?: string | null) => {
  if (stompClient && stompClient.connected) {
    console.log('NotificationService: Already connected.');
    return;
  }

  if (!storeInstance) {
    console.error('NotificationService: Store not initialized. Call initNotificationService first.');
    return;
  }

  let socketUrl = SOCKET_URL;
  if (authToken) {
    socketUrl = `${SOCKET_URL}?token=${encodeURIComponent(authToken)}`;
    console.log(`NotificationService: Connecting to SockJS with URL: ${socketUrl}`);
  } else {
    console.log(`NotificationService: Connecting to SockJS with URL: ${socketUrl} (no auth token)`);
  }

  stompClient = Stomp.over(() => new SockJS(socketUrl));
  stompClient.reconnect_delay = 5000;

  const headers: { [key: string]: string } = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Read the XSRF-TOKEN cookie and add it as an X-CSRF-TOKEN header
  const csrfToken = getCookie('XSRF-TOKEN'); // Default cookie name used by Spring Security
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  } else {
    // This is not necessarily an error if CSRF is handled differently or not strictly required for WS handshake
    // depending on server config, but good to note.
    console.info('NotificationService: XSRF-TOKEN cookie not found. If CSRF is enforced for WebSocket, this might be an issue.');
  }



  stompClient.connect(
    headers,
    (frame?: Frame) => { // onConnect
      console.log('NotificationService: STOMP Connected to broker. Frame:', frame);
      if (stompClient?.connected) {
        console.log(`NotificationService: Attempting to subscribe to ${USER_SPECIFIC_TOPIC}`);
        const subscription = stompClient.subscribe(
          USER_SPECIFIC_TOPIC,
          message => {
            console.log('NotificationService: Received raw message:', message);
            console.log('NotificationService: Received message body:', message.body);
            try {
              const rawPayload = JSON.parse(message.body);

              // Assuming rawPayload is FrontendNotificationPayload from StompNotificationForwarder
              // rawPayload.id = eventId
              // rawPayload.message = JSON string of event properties
              // rawPayload.timestamp = ISO timestamp string
              // rawPayload.eventDetails = NotificationEvent object

              if (rawPayload.id && rawPayload.timestamp && rawPayload.eventDetails) {
                // Construct the object for NotificationMessage.tsx
                // Fields are primarily from rawPayload.eventDetails
                // rawPayload.message is the JSON string (messageTextJson) from the backend.
                // This is what NotificationMessage.tsx expects.
                let messageForFrontend: string;
                if (typeof rawPayload.message === 'string' && rawPayload.message.trim().startsWith('{')) {
                  messageForFrontend = rawPayload.message;
                } else {
                  console.warn(`[WS] Notification ${rawPayload.id}: rawPayload.message is not a valid JSON string or is missing. Payload:`, rawPayload.message);
                  // Create a fallback JSON string for NotificationMessage.tsx to parse.
                  // Use eventDetails for more reliable top-level fields.
                  messageForFrontend = JSON.stringify({
                    eventType: rawPayload.eventDetails?.eventType || "UNKNOWN_EVENT_TYPE_ERROR",
                    actorUserName: rawPayload.eventDetails?.actorUserName || "Unknown User",
                    treeName: rawPayload.eventDetails?.treeName || "Unknown Tree",
                    details: { error: "Original WebSocket message payload was invalid or missing.", rawMessageField: String(rawPayload.message).slice(0,100) },
                    treeId: rawPayload.eventDetails?.treeId || null,
                    actorUserId: rawPayload.eventDetails?.actorUserId || null,
                  });
                }
                console.log(`[WS] Notification ${rawPayload.id} using rawPayload.message (or fallback JSON string) for Notification.message: "${messageForFrontend}"`);

                const frontendNotification: import('./notificationSlice').Notification = {
                  id: rawPayload.id, 
                  message: messageForFrontend, // Pass the JSON string from WebSocket's rawPayload.message
                  timestamp: rawPayload.timestamp,
                  isRead: false, // New notifications from WebSocket are unread
                  link: rawPayload.link, 
                };
                storeInstance?.dispatch(addBackendNotification(frontendNotification));
              } else if (rawPayload.message && (!rawPayload.eventDetails || !rawPayload.id || !rawPayload.timestamp)) { 
                // This case handles if rawPayload.message exists but other critical parts of FrontendNotificationPayload are missing.
                // It implies a simple string message not intended for structured display by NotificationMessage.tsx.
                console.warn('[WS] Received simple message string without full event structure, passing as is. Message:', rawPayload.message);
                storeInstance?.dispatch(addNotification({ message: rawPayload.message, link: rawPayload.link }));
              } else {
                console.warn('[WS] Received notification payload does not match expected structures (e.g., missing id, timestamp, or eventDetails):', rawPayload);
                // Create a JSON string that NotificationMessage.tsx can parse to show an error.
                const errorJsonForMessage = JSON.stringify({
                    eventType: "ERROR_PARSING_WS_PAYLOAD",
                    actorUserName: "System",
                    treeName: "N/A",
                    details: { error: "Received incomplete or unknown-format notification structure via WebSocket.", stringifiedPayload: JSON.stringify(rawPayload).slice(0,200) },
                    treeId: null, actorUserId: null
                });
                storeInstance?.dispatch(addNotification({ message: errorJsonForMessage })); // addNotification typically uses uuid for ID.
                                                                                             // addBackendNotification expects an ID from payload.
                                                                                             // This might need a more specific error notification type.
                                                                                             // For now, using addNotification which creates its own ID.
              }
            } catch (error) {
              console.error('NotificationService: Error parsing message or dispatching action:', error, 'Raw body:', message.body);
               storeInstance?.dispatch(addNotification({ message: 'Received an invalid or unparseable notification.' }));
            }
          },
          { id: 'user-notifications-subscription' } // Custom headers for subscription if needed
        );
        // Note: The actual user-specific topic on the broker side (e.g., /user/someuser-id/queue/notifications)
        // isn't typically exposed directly back to the client's subscribe() callback in STOMP.
        // The client subscribes to the logical name, and the broker handles routing.
        console.log(`NotificationService: Successfully initiated subscription to logical destination ${USER_SPECIFIC_TOPIC}. Client subscription ID: ${subscription.id}`);
      } else {
        console.warn('NotificationService: STOMP client reported not connected after connect callback. Subscription not attempted.');
      }
    },
    (errorFrameOrMessage: Frame | string) => { // onError
      console.error('NotificationService: STOMP connection error.');
      if (typeof errorFrameOrMessage === 'string') {
        console.error('STOMP Error Message:', errorFrameOrMessage);
      } else if (errorFrameOrMessage && errorFrameOrMessage.headers) { // It's a Frame
        console.error('STOMP ERROR Frame Headers:', errorFrameOrMessage.headers);
        console.error('STOMP ERROR Frame Body:', errorFrameOrMessage.body);
        if (errorFrameOrMessage.headers['message']) {
          console.error('Detailed STOMP Error:', errorFrameOrMessage.headers['message']);
        }
      } else {
        console.error('Non-FRAME or unknown error during STOMP connection:', errorFrameOrMessage);
      }
    }
  );

  if (stompClient) {
    stompClient.onWebSocketClose = (event: CloseEvent) => {
      console.warn(`NotificationService: WebSocket connection closed. Code: ${event.code}, Reason: "${event.reason}", Was Clean: ${event.wasClean}`);
    };
    stompClient.onWebSocketError = (event: Event) => {
      console.error('NotificationService: WebSocket error event.', event);
      // Attempt to log more details from the event if possible, though generic Event objects are limited
      if ('message' in event) {
        console.error('WebSocket error message:', (event as any).message);
      }
    };
  }
};

const disconnect = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('NotificationService: Disconnected');
    });
    stompClient = null;
  } else {
    console.log('NotificationService: Not connected, no need to disconnect.');
  }
};

export const notificationService = {
  connect,
  disconnect,
};

export default notificationService;