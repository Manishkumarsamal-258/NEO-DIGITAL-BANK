import { useEffect, useCallback, useRef } from 'react';
import { useDataRefresh } from '@/contexts/DataRefreshContext';

/**
 * A hook that provides real-time data refreshing by combining:
 * 1. Context-level refreshKey changes (triggered by deposit/withdraw/transfer actions)
 * 2. Periodic polling at a configurable interval
 * 3. Window focus detection
 *
 * @param callback - Function to call to refresh data
 * @param intervalMs - Polling interval in milliseconds (default: 15000)
 * @param deps - Additional dependencies for the effect
 */
export function useRealtimeRefresh(
  callback: () => void,
  intervalMs: number = 15000,
  deps: any[] = []
) {
  const { refreshKey } = useDataRefresh();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Run on refreshKey change (triggered by mutations across the app)
  useEffect(() => {
    callbackRef.current();
  }, [refreshKey]);

  // Poll at interval for automatic real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      callbackRef.current();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  // Refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => callbackRef.current();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
}
