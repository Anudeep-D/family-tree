import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { initNotificationService, notificationService }
from '@/redux/notificationService';
import { store } from '@/app/store'; // Import the actual store

interface WebSocketManagerProps {
  children: React.ReactNode;
}

const WebSocketManager = ({ children }: WebSocketManagerProps): JSX.Element => {
  const { isAuthenticated, idToken, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // Initialize the notification service with the store instance.
    // This only needs to be done once.
    initNotificationService(store);
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (isAuthLoading) {
      // Wait for authentication status to be resolved
      return;
    }

    if (isAuthenticated) {
      console.log('WebSocketManager: User authenticated, connecting to WebSocket...');
      // Pass idToken if your STOMP connection requires it.
      // The notificationService.connect method has a placeholder for this.
      notificationService.connect(idToken); 
    } else {
      console.log('WebSocketManager: User not authenticated, disconnecting WebSocket if connected.');
      notificationService.disconnect();
    }

    // Cleanup on component unmount or when authentication status changes
    return () => {
      console.log('WebSocketManager: Cleaning up WebSocket connection.');
      notificationService.disconnect();
    };
  }, [isAuthenticated, idToken, isAuthLoading]);

  return <>{children}</>;
};

export default WebSocketManager;
