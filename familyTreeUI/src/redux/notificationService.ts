import { CompatClient, Stomp, Frame } from '@stomp/stompjs'; // Added Frame
import SockJS from 'sockjs-client';
import { Store } from '@reduxjs/toolkit';
import { addBackendNotification, addNotification } from './notificationSlice'; // Assuming addBackendNotification for structured messages
import { RootState } from '@/app/store'; // To get RootState type

// --- Configuration (replace with your actual backend details) ---
const SOCKET_URL = '/api/ws'; // Your Spring Boot WebSocket endpoint (e.g., '/ws' or '/api/ws')
const USER_SPECIFIC_TOPIC = '/user/queue/notifications'; // For user-specific notifications
// const GENERAL_TOPIC = '/topic/global-notifications'; // Example for general notifications

// Keep track of the STOMP client instance
let stompClient: CompatClient | null = null;
let storeInstance: Store<RootState> | null = null; // To hold the store reference

// Function to initialize the store reference
export const initNotificationService = (store: Store<RootState>) => {
  storeInstance = store;
};

const connect = (authToken?: string | null) => {
  if (stompClient && stompClient.connected) {
    console.log('NotificationService: Already connected.');
    return;
  }

  if (!storeInstance) {
    console.error('NotificationService: Store not initialized. Call initNotificationService first.');
    return;
  }

  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);

  stompClient.reconnect_delay = 5000; // Reconnect every 5 seconds

  const headers: { [key: string]: string } = {};
  if (authToken) {
    // If your backend STOMP endpoint requires authentication via a token (e.g., JWT)
    // you might pass it in headers. Common practice is an 'Authorization': `Bearer ${token}` header.
    // Spring Security typically intercepts this.
    // Alternatively, some setups pass it as a query parameter in SockJS URL,
    // or as part of the STOMP connect frame.
    // Adjust based on your backend's security configuration.
    headers['Authorization'] = `Bearer ${authToken}`;
    // Or, it might be part of the connect frame:
    // stompClient.connect({ login: 'user', passcode: 'password', headerName: authToken }, onConnect, onError);
    console.log('NotificationService: Attempting to connect with auth token.');
  } else {
    console.log('NotificationService: Attempting to connect without auth token.');
  }


  stompClient.connect(
    headers, // Headers for the STOMP connect frame
    () => { // onConnect
      console.log('NotificationService: Connected to WebSocket');
      
      // Subscribe to user-specific notifications
      stompClient?.subscribe(USER_SPECIFIC_TOPIC, message => {
        console.log('NotificationService: Received user-specific message:', message.body);
        try {
          const notificationPayload = JSON.parse(message.body);
          // Assuming backend sends id, message, timestamp, link
          // Use addBackendNotification if backend provides full structure
          // Use addNotification if backend only sends message and link
          if (notificationPayload.id && notificationPayload.timestamp) {
             storeInstance?.dispatch(addBackendNotification(notificationPayload));
          } else {
             storeInstance?.dispatch(addNotification({ message: notificationPayload.message, link: notificationPayload.link }));
          }
        } catch (error) {
          console.error('NotificationService: Error parsing message or dispatching action:', error);
           storeInstance?.dispatch(addNotification({ message: 'Received an invalid notification.' }));
        }
      });

      // Example: Subscribe to a general topic (if you have one)
      /*
      stompClient?.subscribe(GENERAL_TOPIC, message => {
        console.log('NotificationService: Received general message:', message.body);
        try {
          const notificationPayload = JSON.parse(message.body);
          storeInstance?.dispatch(addNotification({ message: notificationPayload.message, link: notificationPayload.link }));
        } catch (error) {
          console.error('NotificationService: Error parsing general message:', error);
        }
      });
      */
    },
    // This errorCallback is for STOMP-level errors during connection (e.g., auth failure).
    // It typically receives a STOMP Frame if the server sends an ERROR frame.
    (errorFrame: Frame) => { // onError - Changed type to Frame
      console.error('NotificationService: STOMP connection error.');
      if (errorFrame && errorFrame.headers) {
        console.error('STOMP ERROR Frame Message:', errorFrame.headers['message']);
        if (errorFrame.body) {
          console.error('Details:', errorFrame.body);
        }
      } else {
        // If it's not a Frame, log the raw error. This case should be rare for this callback.
        console.error('Non-FRAME error during STOMP connection:', errorFrame);
      }
      // Reconnection is typically handled by stompClient.reconnect_delay.
      // Additional UI feedback for connection failure can be added here.
    }
  );

  // For handling WebSocket closure post-successful STOMP connection:
  if (stompClient) {
    stompClient.onWebSocketClose = (event: CloseEvent) => {
      console.warn('NotificationService: WebSocket connection closed.', event);
      // Reconnection is handled by stompClient.reconnect_delay.
      // You might want to dispatch an action to update UI about disconnection status.
    };

    stompClient.onWebSocketError = (event: Event) => {
      console.error('NotificationService: WebSocket error event.', event);
      // This might be a more generic error from the WebSocket itself.
    };
  }

  // Optional: For debugging low-level STOMP communication
  // stompClient.debug = (str) => {
  //   console.log('STOMP DEBUG:', str);
  // };
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

// --- Public API for the service ---
export const notificationService = {
  connect,
  disconnect,
  // Potentially add a function to send messages if needed in the future
  // sendMessage: (destination: string, body: any) => {
  //   if (stompClient && stompClient.connected) {
  //     stompClient.publish({ destination, body: JSON.stringify(body) });
  //   } else {
  //     console.error('NotificationService: Cannot send message, not connected.');
  //   }
  // }
};

// Note: The actual connection should be initiated from a React component,
// typically using useEffect, and after user authentication.
// The `initNotificationService` also needs to be called once at app startup with the store.
// The `authToken` for the connect function should be retrieved from your auth state (e.g., useAuth hook).
// Example of how `authToken` might be passed if your STOMP connection needs it:
// In your React component:
// const { idToken } = useAuth(); // from your useAuth.tsx
// useEffect(() => {
//   if (isAuthenticated && idToken) {
//     notificationService.connect(idToken); // Pass token here
//   }
//   return () => {
//     notificationService.disconnect();
//   };
// }, [isAuthenticated, idToken]);

export default notificationService;
