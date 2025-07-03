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
    console.log('NotificationService: Adding X-CSRF-TOKEN header from cookie.');
  } else {
    // This is not necessarily an error if CSRF is handled differently or not strictly required for WS handshake
    // depending on server config, but good to note.
    console.info('NotificationService: XSRF-TOKEN cookie not found. If CSRF is enforced for WebSocket, this might be an issue.');
  }

  console.log(`NotificationService: Attempting STOMP connection to ${socketUrl} with headers:`, JSON.stringify(headers));


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
              const notificationPayload = JSON.parse(message.body);
              // Check if it's a structured backend notification or a simple one
              if (notificationPayload.eventId && notificationPayload.treeId && notificationPayload.eventType) {
                 console.log('NotificationService: Dispatching addBackendNotification with payload:', notificationPayload);
                 storeInstance?.dispatch(addBackendNotification(notificationPayload as any)); // Cast as any to match expected structure more loosely initially
              } else if (notificationPayload.message) { // Fallback for simpler message structure
                 console.log('NotificationService: Dispatching addNotification (simple) with payload:', notificationPayload);
                 storeInstance?.dispatch(addNotification({ message: notificationPayload.message, link: notificationPayload.link }));
              } else {
                console.warn('NotificationService: Received notification payload does not match expected structures:', notificationPayload);
                storeInstance?.dispatch(addNotification({ message: 'Received an unkown-format notification.' }));
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