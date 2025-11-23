import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  warningTime: number; 
  logoutTime: number; // I want total time in milliseconds before auto-logout (30 minutes)
  onLogout: () => void;
  enabled: boolean; // this help us to Whether the timeout is enabled (only when logged in)
}

export const useSessionTimeout = ({
  warningTime,
  logoutTime,
  onLogout,
  enabled,
}: UseSessionTimeoutOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const warningStartTimeRef = useRef<number>(0);
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const resetTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // I want to hide warning if it was showing
    setShowWarning(false);
    setTimeRemaining(0);

    if (!enabled) {
      return;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set warning timer (25 minutes)
    warningTimerRef.current = setTimeout(() => {
      const warningStartTime = Date.now();
      warningStartTimeRef.current = warningStartTime;
      setShowWarning(true);
      const remaining = logoutTime - warningTime; // 5 minutes in ms
      setTimeRemaining(remaining);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - warningStartTime;
        const remaining = Math.max(0, logoutTime - warningTime - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }, 1000);

      // Set logout timer (5 minutes after warning)
      logoutTimerRef.current = setTimeout(() => {
        onLogout();
      }, remaining);
    }, warningTime);
  }, [warningTime, logoutTime, onLogout, enabled]);

  const handleStaySignedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  const handleSignOut = useCallback(() => {
    // Clear all timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowWarning(false);
    onLogout();
  }, [onLogout]);

  // Track my session user activity
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout: number | null = null;

    const handleActivity = () => {
      // Debounce activity tracking to avoid too many resets
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }

      activityTimeout = setTimeout(() => {
        if (!showWarning) {
          // Only reset if warning is not showing (to avoid resetting during countdown)
          resetTimers();
        }
      }, 1000); // 1 second debounce
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, true);
    });

    // Initialize timers
    resetTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, true);
      });
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [enabled, resetTimers, showWarning]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    showWarning,
    timeRemaining: formatTimeRemaining(timeRemaining),
    handleStaySignedIn,
    handleSignOut,
  };
};

