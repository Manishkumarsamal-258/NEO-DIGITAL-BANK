import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Database, Shield, Building2, ArrowRightLeft, CheckCircle2, XCircle, Activity, Server, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, Account } from '@/types';

interface SyncStatus {
  service: string;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync: Date | null;
  message: string;
}

interface RealTimeTrackerProps {
  user?: User | null;
  accounts?: Account[];
  onRefresh?: () => void;
}

export default function RealTimeTracker({ user, accounts, onRefresh }: RealTimeTrackerProps) {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    { service: 'Auth Service', status: 'pending', lastSync: null, message: 'Waiting to check...' },
    { service: 'Account Service', status: 'pending', lastSync: null, message: 'Waiting to check...' },
    { service: 'Transaction Service', status: 'pending', lastSync: null, message: 'Waiting to check...' },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null);

  const checkServiceHealth = useCallback(async (index: number) => {
    const endpoints = [
      { name: 'Auth Service', path: '/api/auth/login', method: 'POST' },
      { name: 'Account Service', path: '/api/accounts', method: 'GET' },
      { name: 'Transaction Service', path: '/api/transactions', method: 'GET' },
    ];
    const ep = endpoints[index];
    
    setSyncStatuses(prev => prev.map((s, i) => 
      i === index ? { ...s, status: 'syncing', message: 'Checking connection...' } : s
    ));
    
    try {
      const token = localStorage.getItem('neobank_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(ep.path, { 
        method: ep.method,
        headers,
        body: ep.method === 'POST' ? JSON.stringify({ email: 'alice@neobank.com', password: 'password123' }) : undefined,
        signal: AbortSignal.timeout(5000) 
      });
      if (res.ok) {
        setSyncStatuses(prev => prev.map((s, i) => 
          i === index ? { 
            ...s, 
            status: 'synced', 
            lastSync: new Date(),
            message: 'Connected to monolith service' 
          } : s
        ));
      } else {
        setSyncStatuses(prev => prev.map((s, i) => 
          i === index ? { 
            ...s, 
            status: 'error', 
            message: `Service returned ${res.status}` 
          } : s
        ));
      }
    } catch {
      setSyncStatuses(prev => prev.map((s, i) => 
        i === index ? { 
          ...s, 
          status: 'error', 
          message: 'Connection timeout - service may be offline' 
        } : s
      ));
    }
  }, []);

  const syncAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([0, 1, 2].map(i => checkServiceHealth(i)));
    setLastGlobalSync(new Date());
    if (onRefresh) onRefresh();
    setIsRefreshing(false);
    
    const allSynced = syncStatuses.every(s => s.status === 'synced');
    if (allSynced) {
      toast.success('All services synchronized', {
        description: 'Data is up-to-date across all microservices',
      });
    } else {
      toast.error('Some services are offline', {
        description: 'Data may not be fully synchronized',
      });
    }
  }, [checkServiceHealth, onRefresh]);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncAll();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Auth Service': return <Shield className="w-4 h-4" />;
      case 'Account Service': return <Building2 className="w-4 h-4" />;
      case 'Transaction Service': return <ArrowRightLeft className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'syncing': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <CardTitle className="text-white text-base">Service Synchronization</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Real-time status of microservices connectivity
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              syncStatuses.every(s => s.status === 'synced') ? 'bg-green-400 animate-pulse' :
              syncStatuses.some(s => s.status === 'syncing') ? 'bg-blue-400 animate-pulse' :
              'bg-red-400'
            }`} />
            <span className="text-xs text-gray-500">
              {syncStatuses.every(s => s.status === 'synced') ? 'All Connected' :
               syncStatuses.some(s => s.status === 'syncing') ? 'Syncing...' :
               'Disconnected'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={syncAll}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {syncStatuses.map((svc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${
                  svc.status === 'synced' ? 'bg-green-500/10' :
                  svc.status === 'error' ? 'bg-red-500/10' :
                  'bg-gray-700/50'
                }`}>
                  {getServiceIcon(svc.service)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200">{svc.service}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      svc.status === 'synced' ? 'border-green-500/30 text-green-400' :
                      svc.status === 'error' ? 'border-red-500/30 text-red-400' :
                      svc.status === 'syncing' ? 'border-blue-500/30 text-blue-400' :
                      'border-gray-600 text-gray-500'
                    }`}>
                      {svc.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{svc.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {getStatusIcon(svc.status)}
                {svc.lastSync && (
                  <span>{svc.lastSync.toLocaleTimeString()}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {lastGlobalSync && (
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
            <span>Last full sync: {lastGlobalSync.toLocaleString()}</span>
            <span className="text-cyan-500">
              <Database className="w-3 h-3 inline mr-1" />
              {syncStatuses.filter(s => s.status === 'synced').length}/3 services online
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
