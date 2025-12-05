import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { websocketService } from '../services/websocket.service';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: any;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
});

export const WebSocketContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const connectingRef = useRef(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated) {
      // Disconnect if not authenticated
      const existingSocket = websocketService.getSocket();
      if (existingSocket) {
        websocketService.disconnect();
        setConnected(false);
        socketRef.current = null;
        connectingRef.current = false;
      }
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (connectingRef.current) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    const existingSocket = websocketService.getSocket();
    
    // If socket already exists and is connected, just update state
    if (existingSocket && existingSocket.connected) {
      setConnected(true);
      socketRef.current = existingSocket;
      return;
    }

    // Connect if we have a token and no existing connected socket
    if (token && !existingSocket) {
      connectingRef.current = true;
      
      // Small delay to ensure token is fully set
      const connectTimeout = setTimeout(() => {
        const socket = websocketService.connect(token);
        socketRef.current = socket;
        
        const onConnect = () => {
          setConnected(true);
          connectingRef.current = false;
        };
        
        const onDisconnect = (reason: string) => {
          console.log('WebSocket disconnected:', reason);
          setConnected(false);
          // Only clear refs if it's an intentional disconnect
          if (reason === 'io client disconnect' || !isAuthenticated) {
            connectingRef.current = false;
            socketRef.current = null;
          }
        };
        
        const onError = (error: Error) => {
          console.error('WebSocket connection error:', error.message);
          setConnected(false);
          connectingRef.current = false;
          socketRef.current = null;
        };
        
        socket?.on('connect', onConnect);
        socket?.on('disconnect', onDisconnect);
        socket?.on('connect_error', onError);
      }, 200);

      return () => {
        clearTimeout(connectTimeout);
        // Don't disconnect here - only clean up the timeout
        // The socket will be managed by the service
      };
    }

    // Cleanup: disconnect when auth becomes false or component unmounts
    return () => {
      const existingSocket = websocketService.getSocket();
      if (existingSocket) {
        websocketService.disconnect();
        setConnected(false);
        socketRef.current = null;
        connectingRef.current = false;
      }
    };
  }, [isAuthenticated]);

  const contextValue = useMemo(() => ({
    socket: websocketService.getSocket(),
    connected,
  }), [connected]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Export hook separately to maintain Fast Refresh compatibility
function useWebSocket() {
  return useContext(WebSocketContext);
}

export { useWebSocket };

