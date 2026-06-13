import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAccounts } from '@/services/accountService';
import { requireAuth } from '@/lib/auth';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { formatCurrency } from '@/lib/mockData';
import { toast } from 'sonner';
import { 
  CreditCard, 
  PiggyBank, 
  Building2, 
  Plus, 
  Eye, 
  EyeOff,
  Loader2,
  Copy,
  RefreshCw,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  Banknote,
  ArrowRight,
  Check
} from 'lucide-react';
import type { Account, User } from '@/types';

const accountTypeConfig = {
  savings: { 
    icon: PiggyBank, 
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    textColor: 'text-blue-400',
    label: 'Savings Account'
  },
  checking: { 
    icon: CreditCard, 
    gradient: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30',
    textColor: 'text-green-400',
    label: 'Checking Account'
  },
  fixed_deposit: { 
    icon: Building2, 
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    textColor: 'text-purple-400',
    label: 'Fixed Deposit'
  },
};

function AccountDetailCard({ account }: { account: Account }) {
  const config = accountTypeConfig[account.accountType] || accountTypeConfig.savings;
  const Icon = config.icon;
  const [copying, setCopying] = useState(false);

  const copyNumber = () => {
    if (account.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopying(true);
      toast.success('Account number copied!');
      setTimeout(() => setCopying(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gray-800/80 border ${config.border}`}>
            <Icon className={`h-6 w-6 ${config.textColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.label}</h3>
            <p className="text-xs text-gray-400">
              Opened {new Date(account.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant={account.status === 'active' ? 'default' : 'secondary'} 
          className={account.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
          {account.status === 'frozen' ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
          {account.status}
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-white">{formatCurrency(account.balance)}</p>
        <p className="text-sm text-gray-400 mt-1">{account.currency || 'INR'}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 rounded bg-gray-800/80 text-sm text-gray-300 font-mono">
            ****{account.accountNumber?.slice(-4)}
          </code>
          <button onClick={copyNumber} className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors">
            {copying ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <TrendingUp className="h-4 w-4" />
          <span>{account.interestRate}% APR</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyAccounts() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const accs = await getAccounts();
      setAccounts(accs);
    } catch (err) {
      toast.error('Failed to load accounts');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    loadAccounts();
  }, []);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadAccounts, 15000);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <AppLayout title="My Accounts" subtitle="Manage all your bank accounts">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-700/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {hideBalances ? '****' : formatCurrency(totalBalance)}
                  </p>
                </div>
                <button 
                  onClick={() => setHideBalances(!hideBalances)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  {hideBalances ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Active Accounts</p>
              <p className="text-3xl font-bold text-white mt-1">
                {accounts.filter(a => a.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Account Types</p>
              <p className="text-3xl font-bold text-white mt-1">
                {new Set(accounts.map(a => a.accountType)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Accounts</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAccounts} 
            disabled={loading}
            className="border-gray-600 text-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : accounts.length === 0 ? (
          <Card className="border-gray-700/50">
            <CardContent className="pt-6 text-center py-12">
              <Banknote className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No accounts found</p>
              <p className="text-sm text-gray-500 mt-1">Contact a teller to open a new account</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(account => (
              <AccountDetailCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

