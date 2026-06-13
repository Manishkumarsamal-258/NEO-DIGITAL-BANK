import { useState, useEffect, useCallback, useRef } from 'react';
import { getAccounts } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import type { Account, Transaction, User } from '@/types';
import { toast } from 'sonner';
import { useDataRefresh } from '@/contexts/DataRefreshContext';

interface SyncState {
  accounts: Account[];
  transactions: Transaction[];
  lastSync: Date | null;
  isSyncing: boolean;
  accountChanged: boolean;
  prevAccountCount: number;
}

export function useServiceSync(user: User | null) {
  const { refreshKey } = useDataRefresh();
  const [syncState, setSyncState] = useState<SyncState>({
    accounts: [],
    transactions: [],
    lastSync: null,
    isSyncing: false,
    accountChanged: false,
    prevAccountCount: 0,
  });
  const prevAccountCountRef = useRef(0);

  const syncData = useCallback(async (showNotification: boolean = false) => {
    if (!user) return;
    
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const [accounts, transactions] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      
      setSyncState(prev => {
        const newCount = accounts?.length || 0;
        const oldCount = prevAccountCountRef.current;
        const changed = oldCount > 0 && newCount !== oldCount;
        
        prevAccountCountRef.current = newCount;
        
        // Notify user if accounts changed
        if (changed && showNotification) {
          if (newCount < oldCount) {
            toast.warning('Account Removed', {
              description: 'An account has been removed from your profile by the bank.',
              duration: 6000,
            });
          } else if (newCount > oldCount) {
            toast.success('New Account Added', {
              description: 'A new account has been added to your profile.',
              duration: 5000,
            });
          }
        }
        
        return {
          accounts: accounts || [],
          transactions: transactions || [],
          lastSync: new Date(),
          isSyncing: false,
          accountChanged: changed,
          prevAccountCount: newCount,
        };
      });
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [user, refreshKey]);

  // Initial sync (polling effect handles re-sync on refreshKey changes)
  useEffect(() => {
    if (user) {
      syncData(false);
    }
  }, [user]);

  // Poll every 5 seconds + immediate sync on refreshKey change
  useEffect(() => {
    if (!user) return;
    
    // Immediate sync when this effect runs (on mount or refreshKey change)
    syncData(true);
    
    const interval = setInterval(() => {
      syncData(true);
    }, 5000);
    
    // Refetch when window regains focus
    const handleFocus = () => syncData(true);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, syncData]);

  return {
    ...syncState,
    syncData: () => syncData(true),
  };
}
