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
    console.warn('NotificationService: XSRF-TOKEN cookie not found. CSRF protection might fail.');
  }

  console.log('NotificationService: Attempting to connect with headers:', headers);


  stompClient.connect(
    headers,
    () => { // onConnect
      console.log('NotificationService: STOMP Connected to broker.');
      if (stompClient?.connected) {
        const subscription = stompClient.subscribe(
          USER_SPECIFIC_TOPIC,
          message => {
            console.log('NotificationService: Received message body:', message.body);
            try {
              const notificationPayload = JSON.parse(message.body);
              if (notificationPayload.id && notificationPayload.timestamp) {
                 storeInstance?.dispatch(addBackendNotification(notificationPayload));
              } else {
                 storeInstance?.dispatch(addNotification({ message: notificationPayload.message, link: notificationPayload.link }));
              }
            } catch (error) {
              console.error('NotificationService: Error parsing message or dispatching action:', error);
               storeInstance?.dispatch(addNotification({ message: 'Received an invalid notification.' }));
            }
          },
          { id: 'user-notifications-subscription' }
        );
        console.log(`NotificationService: Subscribed to ${USER_SPECIFIC_TOPIC} with client-side ID: ${subscription.id}`);
      } else {
        console.warn('NotificationService: STOMP client not connected at time of subscription attempt, cannot subscribe.');
      }
    },
    (errorFrame: Frame) => {
      console.error('NotificationService: STOMP connection error.');
      if (errorFrame && errorFrame.headers) {
        console.error('STOMP ERROR Frame Message:', errorFrame.headers['message']);
        if (errorFrame.body) {
          console.error('Details:', errorFrame.body);
        }
      } else {
        console.error('Non-FRAME error during STOMP connection:', errorFrame);
      }
    }
  );

  if (stompClient) {
    stompClient.onWebSocketClose = (event: CloseEvent) => {
      console.warn('NotificationService: WebSocket connection closed.', event);
    };
    stompClient.onWebSocketError = (event: Event) => {
      console.error('NotificationService: WebSocket error event.', event);
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