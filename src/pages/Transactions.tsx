import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TransactionRow from '@/components/features/TransactionRow';
import { requireAuth } from '@/lib/auth';
import { getTransactions } from '@/services/transactionService';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import type { Transaction, TransactionStatus, TransactionType, User } from '@/types';
import { Search, SlidersHorizontal, Download, X, RefreshCw } from 'lucide-react';

type FilterStatus = TransactionStatus | 'all';
type FilterType = TransactionType | 'all';

export default function Transactions() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (u?: User) => {
    const currentUser = u || user;
    if (!currentUser) return;
    try {
      const allTx = await getTransactions();
      const userTx = currentUser.role === 'admin' ? allTx : allTx.filter(t => t.userId === currentUser.id);
      setTransactions(userTx);
      setFiltered(userTx);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    loadData(u);
  }, []);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 15000);

  useEffect(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        (t.beneficiaryName || '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (dateFrom) result = result.filter(t => new Date(t.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(t => new Date(t.createdAt) <= new Date(dateTo + 'T23:59:59'));
    setFiltered(result);
  }, [search, statusFilter, typeFilter, dateFrom, dateTo, transactions]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = search || statusFilter !== 'all' || typeFilter !== 'all' || dateFrom || dateTo;

  const statusCounts = {
    all: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    processing: transactions.filter(t => t.status === 'processing').length,
  };

  if (loading) {
    return (
      <AppLayout title="Transaction History" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Transaction History" subtitle={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}${user?.role === 'admin' ? ' (all accounts)' : ''}`}>
      <div className="space-y-5">
        {/* Status Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(statusCounts) as [FilterStatus, number][]).map(([s, count]) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                statusFilter === s
                  ? s === 'failed' ? 'bg-red-500 text-white border-red-500' :
                    s === 'completed' ? 'bg-green-500 text-white border-green-500' :
                    s === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' :
                    s === 'processing' ? 'bg-blue-500 text-white border-blue-500' :
                    'gradient-primary text-white border-primary'
                  : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {s === 'all' ? 'All' : s} ({count})
            </button>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by description, reference, or beneficiary..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
              />
              {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Type</label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as FilterType)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {filtered.length} of {transactions.length} transactions</p>
            <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50 px-2 py-2">
              {filtered.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
