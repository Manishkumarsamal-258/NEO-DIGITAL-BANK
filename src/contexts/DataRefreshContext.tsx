import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

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
    setRefreshKey(prev => prev + 1);
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
