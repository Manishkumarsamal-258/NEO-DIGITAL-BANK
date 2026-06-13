import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAccounts } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { requireAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/mockData';
import TransactionExport from '@/components/features/TransactionExport';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { toast } from 'sonner';
import { 
  FileText, 
  FileDown, 
  Calendar, 
  Loader2, 
  Banknote, 
  Download,
  FileSpreadsheet,
  File,
  Printer,
  ChevronDown,
  Search
} from 'lucide-react';
import type { Account, User, Transaction } from '@/types';

export default function Statements() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [accs, txns] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      setAccounts(accs);
      setTransactions(txns);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    loadData();
  }, []);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 15000);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '1m': return new Date(now.setMonth(now.getMonth() - 1));
      case '3m': return new Date(now.setMonth(now.getMonth() - 3));
      case '6m': return new Date(now.setMonth(now.getMonth() - 6));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return null;
    }
  };

  const dateThreshold = getDateFilter();
  
  const filtered = transactions.filter(tx => {
    if (selectedAccount !== 'all' && tx.fromAccountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
      return false;
    }
    if (dateThreshold && new Date(tx.createdAt) < dateThreshold) {
      return false;
    }
    return true;
  });

  const getStats = () => {
    const credits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const debits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    return { credits, debits, count: filtered.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AppLayout title="E-Statements" subtitle="Download account statements">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="E-Statements" subtitle="Download account statements and transaction reports">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-700/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.count}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Total Credits</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats.credits)}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-red-500/10 to-red-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Total Debits</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(stats.debits)}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">Net Flow</p>
              <p className={`text-2xl font-bold mt-1 ${stats.credits - stats.debits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(stats.credits - stats.debits)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Generate Statement
            </CardTitle>
            <CardDescription>Select filters and download your statement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} - ****{acc.accountNumber?.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Date Range</label>
                <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="1m">Last Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Export Format</label>
                <div className="pt-1">
                  <TransactionExport 
                    transactions={filtered} 
                    userName={user?.name} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statement Preview */}
        <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-400" />
              Statement Preview
            </CardTitle>
            <CardDescription>{filtered.length} transactions found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.slice(0, 10).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Banknote className={`h-4 w-4 ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-xs capitalize ${
                      tx.status === 'completed' ? 'text-green-500' : 
                      tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                    }`}>{tx.status}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions found for the selected filters</p>
                </div>
              )}
              {filtered.length > 10 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  Showing 10 of {filtered.length} transactions. Download the full statement for complete data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-500/30 transition-colors">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="font-medium text-white">PDF Statement</p>
              <p className="text-xs text-gray-400 mt-1">Formatted PDF with summary and details</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-green-500/30 transition-colors">
            <CardContent className="pt-6 text-center">
              <FileSpreadsheet className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="font-medium text-white">Excel Report</p>
              <p className="text-xs text-gray-400 mt-1">XLSX format for data analysis</p>
            </CardContent>
          </Card>
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-orange-500/30 transition-colors">
            <CardContent className="pt-6 text-center">
              <File className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="font-medium text-white">CSV Export</p>
              <p className="text-xs text-gray-400 mt-1">Comma-separated values for spreadsheets</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
