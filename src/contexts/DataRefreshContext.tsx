import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// localStorage key used as a cross-tab sync signal
const SYNC_KEY = 'neobank_sync_timestamp';

interface DataRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  lastRefresh: number;
}

const DataRefreshContext = createContext<DataRefreshContextType>({
  refreshKey: 0,
  triggerRefresh: () => {},
  lastRefresh: Date.now(),
});

export function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const lastRefresh = useRef(Date.now());

  const triggerRefresh = useCallback(() => {
    lastRefresh.current = Date.now();
    // Write a timestamp to localStorage so OTHER tabs detect the change
    try {
      localStorage.setItem(SYNC_KEY, String(lastRefresh.current));
    } catch {}
    setRefreshKey(prev => prev + 1);
  }, []);

  // ── Cross-tab sync via storage event ────────────────────────
  // When another tab writes to localStorage, this tab receives a 'storage' event.
  // We react by triggering a data refresh so the receiver sees updates in real-time.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // React to any neobank_* key change OR the explicit sync signal
      if (
        e.key === SYNC_KEY ||
        (e.key && e.key.startsWith('neobank_'))
      ) {
        lastRefresh.current = Date.now();
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ── Page visibility refresh ─────────────────────────────────
  // When the user switches back to this tab, refresh data immediately
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastRefresh.current = Date.now();
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh, lastRefresh: lastRefresh.current }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  return useContext(DataRefreshContext);
}
