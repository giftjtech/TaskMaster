import { useEffect, useRef } from 'react';
import { websocketService } from '../services/websocket.service';
import { API_URL } from '../utils/constants';

/**
 * Hook to handle session cleanup when application is closed
 * Ensures session is destroyed on:
 * - Tab/window close (beforeunload/pagehide)
 * - Browser navigation away
 */
export const useSessionCleanup = (isAuthenticated: boolean) => {
  const cleanupInProgressRef = useRef(false);
  const beaconSentRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const cleanupSession = (isBeacon: boolean = false) => {
      // Prevent multiple cleanup calls
      if (cleanupInProgressRef.current) {
        return;
      }
      cleanupInProgressRef.current = true;

      try {
        // Disconnect WebSocket immediately
        websocketService.disconnect();

        // Get token before clearing storage
        const token = localStorage.getItem('accessToken');

        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // For beforeunload/pagehide, use fetch with keepalive for reliable delivery
        if (isBeacon && token && !beaconSentRef.current) {
          beaconSentRef.current = true;
          const logoutUrl = `${API_URL}/auth/logout`;
          
          // Use fetch with keepalive for reliable delivery during page unload
          fetch(logoutUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            keepalive: true,
            credentials: 'include',
          }).catch(() => {
            // Ignore errors during cleanup - session is already cleared locally
          });
        }
      } catch (error) {
        // Ignore errors during cleanup - we've already cleared local storage
        console.warn('Session cleanup error (non-critical):', error);
      }
    };

    // Handle tab/window close - beforeunload fires first
    const handleBeforeUnload = () => {
      cleanupSession(true);
    };

    // Handle page unload (navigation away or tab close)
    // pagehide is more reliable than beforeunload for cleanup
    const handlePageHide = (event: PageTransitionEvent) => {
      // Only cleanup if page is being unloaded (not just hidden)
      if (event.persisted === false) {
        cleanupSession(true);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      cleanupInProgressRef.current = false;
    };
  }, [isAuthenticated]);
};

