import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AccountCard from '@/components/features/AccountCard';
import { requireAuth } from '@/lib/auth';
import { getCustomers } from '@/services/tellerService';
import { getCustomerAccounts, createAccount, deposit, withdraw, toggleFreeze } from '@/services/tellerService';
import { formatCurrency } from '@/lib/mockData';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import { useDataRefresh } from '@/contexts/DataRefreshContext';
import type { User, Account } from '@/types';
import { Plus, Search, Banknote, UserPlus, X, CheckCircle2, ArrowDownLeft, ArrowUpRight, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TellerCenter() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<User[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showTransaction, setShowTransaction] = useState<'deposit' | 'withdraw' | null>(null);
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [newAccType, setNewAccType] = useState<'savings' | 'checking' | 'fixed_deposit'>('savings');
  const [newAccInitial, setNewAccInitial] = useState('');
  const [loading, setLoading] = useState(true);
  const { triggerRefresh } = useDataRefresh();

  // Also refresh selected customer accounts when data refreshes
  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerAccounts(selectedCustomer.id);
    }
  }, [selectedCustomer?.id]);

  useEffect(() => {
    const u = requireAuth();
    if (!u || u.role !== 'teller') return;
    setUser(u);
    loadCustomers();
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const custs = await getCustomers();
      setCustomers(custs);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomerAccounts = useCallback(async (customerId: string) => {
    try {
      const accs = await getCustomerAccounts(customerId);
      setAllAccounts(prev => {
        const filtered = prev.filter(a => a.userId !== customerId);
        return [...filtered, ...accs];
      });
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }, []);

  // Combined refresh: customers + selected customer's accounts
  const refreshAll = useCallback(async () => {
    await loadCustomers();
    if (selectedCustomer) {
      await loadCustomerAccounts(selectedCustomer.id);
    }
  }, [loadCustomers, loadCustomerAccounts, selectedCustomer]);

  // Real-time: poll every 10s + refresh on deposits/transfers (refreshes both customers & their accounts)
  useRealtimeRefresh(refreshAll, 10000);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerAccounts = selectedCustomer ? allAccounts.filter(a => a.userId === selectedCustomer.id) : [];

  const handleCustomerSelect = (cust: User) => {
    setSelectedCustomer(cust);
  };

  const handleCreateAccount = async () => {
    if (!selectedCustomer) { toast.error('Select a customer first.'); return; }
    if (!newAccInitial || parseFloat(newAccInitial) < 0) { toast.error('Enter a valid initial deposit.'); return; }
    try {
      const result = await createAccount({
        userId: selectedCustomer.id,
        accountType: newAccType,
        initialDeposit: parseFloat(newAccInitial),
      });
      if (result.success && result.account) {
        setAllAccounts(prev => [...prev, result.account!]);
        setShowNewAccount(false);
        setNewAccInitial('');
        triggerRefresh();
        toast.success(`${newAccType.replace('_', ' ')} account created for ${selectedCustomer.name}.`, {
          description: `Account number: ${result.account.accountNumber}`,
        });
      } else {
        toast.error(result.error || 'Failed to create account.');
      }
    } catch (err) {
      toast.error('Failed to create account.');
    }
  };

  const handleTransaction = async (type: 'deposit' | 'withdraw') => {
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
    if (!selectedCustomer) return;

    try {
      const result = type === 'deposit'
        ? await deposit(selectedCustomer.id, amt, txDesc)
        : await withdraw(selectedCustomer.id, amt, txDesc);

      if (result.success) {
        await loadCustomerAccounts(selectedCustomer.id);
        setShowTransaction(null);
        setTxAmount('');
        setTxDesc('');
        triggerRefresh();
        toast.success(`${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${formatCurrency(amt)} ${type === 'deposit' ? 'to' : 'from'} ${selectedCustomer.name}'s account.`);
      } else {
        toast.error(result.error || 'Transaction failed.');
      }
    } catch (err) {
      toast.error('Transaction failed.');
    }
  };

  const handleToggleFreeze = async (acc: Account) => {
    const result = await toggleFreeze(acc.id);
    if (result.success) {
      setAllAccounts(prev => prev.map(a =>
        a.id === acc.id ? { ...a, status: a.status === 'active' ? 'frozen' as const : 'active' as const } : a
      ));
      triggerRefresh();
      toast.success(`Account ${acc.status === 'active' ? 'frozen' : 'unfrozen'}.`);
    } else {
      toast.error(result.error || 'Failed to update account status.');
    }
  };

  if (loading) {
    return (
      <AppLayout title="Teller Center" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Teller Center" subtitle="Manage customer accounts and banking operations">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-1">
            {filteredCustomers.map(c => (
              <button
                key={c.id}
                onClick={() => handleCustomerSelect(c)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${selectedCustomer?.id === c.id ? 'bg-primary/8 border border-primary/20' : 'hover:bg-muted'}`}
              >
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {c.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-5">
          {!selectedCustomer ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
              <UserPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">Select a customer</p>
              <p className="text-sm text-muted-foreground mt-1">Choose a customer from the list to manage their accounts.</p>
            </div>
          ) : (
            <>
              {/* Customer Info */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                      {selectedCustomer.avatarInitials}
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-lg text-foreground">{selectedCustomer.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.phone} · Member since {selectedCustomer.createdAt}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowTransaction('deposit')} className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors shadow-md">
                  <ArrowDownLeft className="w-4 h-4" /> Deposit
                </button>
                <button onClick={() => setShowTransaction('withdraw')} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md">
                  <ArrowUpRight className="w-4 h-4" /> Withdraw
                </button>
                <button onClick={() => setShowNewAccount(true)} className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
                  <Plus className="w-4 h-4" /> New Account
                </button>
              </div>

              {/* Accounts */}
              <div>
                <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3">Accounts ({customerAccounts.length})</h3>
                {customerAccounts.length === 0 ? (
                  <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
                    <Banknote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No accounts yet</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {customerAccounts.map(acc => (
                      <div key={acc.id} className="space-y-2">
                        <AccountCard account={acc} />
                        <button
                          onClick={() => handleToggleFreeze(acc)}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${acc.status === 'active' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                        >
                          {acc.status === 'active' ? 'Freeze Account' : 'Unfreeze Account'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransaction && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTransaction(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-base capitalize">{showTransaction} Funds</h3>
              <button onClick={() => setShowTransaction(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Customer: <span className="font-semibold text-foreground">{selectedCustomer.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                  <input type="number" min="1" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Description</label>
                <input value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Reason for transaction"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              onClick={() => handleTransaction(showTransaction)}
              className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-md ${showTransaction === 'deposit' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm {showTransaction === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {showNewAccount && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewAccount(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-base">Create New Account</h3>
              <button onClick={() => setShowNewAccount(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">For: <span className="font-semibold text-foreground">{selectedCustomer.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Account Type</label>
                <select value={newAccType} onChange={e => setNewAccType(e.target.value as typeof newAccType)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="savings">Savings Account (3.5% p.a.)</option>
                  <option value="checking">Checking Account (0.5% p.a.)</option>
                  <option value="fixed_deposit">Fixed Deposit (5.0% p.a.)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Initial Deposit (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                  <input type="number" min="0" value={newAccInitial} onChange={e => setNewAccInitial(e.target.value)} placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
            <button onClick={handleCreateAccount} className="w-full mt-4 gradient-primary text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
              <CheckCircle2 className="w-4 h-4" /> Create Account
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
