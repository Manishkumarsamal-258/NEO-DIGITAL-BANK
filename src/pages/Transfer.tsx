import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AccountCard from '@/components/features/AccountCard';
import { requireAuth } from '@/lib/auth';
import { getAccounts } from '@/services/accountService';
import { getBeneficiaries } from '@/services/beneficiaryService';
import { transfer } from '@/services/transactionService';
import { lookupAccountByNumber } from '@/services/adminService';
import { useDataRefresh } from '@/contexts/DataRefreshContext';
import { formatCurrency } from '@/lib/mockData';
import type { Account, Beneficiary, Transaction, User } from '@/types';
import { ArrowLeftRight, CheckCircle2, ChevronDown, AlertCircle, RefreshCw, TrendingDown, TrendingUp, Search, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'form' | 'review' | 'success';

export default function TransferPage() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [step, setStep] = useState<Step>('form');
  const [processing, setProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const { triggerRefresh, refreshKey } = useDataRefresh();
  const [loading, setLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toBeneficiaryId, setToBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferType, setTransferType] = useState<'beneficiary' | 'manual'>('beneficiary');
  const [manualAccountNum, setManualAccountNum] = useState('');

  // ── Account number validation state ──────────────────────────
  const [accountLookup, setAccountLookup] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    ownerName?: string;
    ownerEmail?: string;
    message?: string;
  }>({ status: 'idle' });
  const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateAccountNumber = useCallback(async (accNum: string) => {
    if (!accNum || accNum.length < 4) {
      setAccountLookup({ status: 'idle' });
      return;
    }
    setAccountLookup({ status: 'checking' });
    try {
      const result = await lookupAccountByNumber(accNum);
      if (result) {
        // Prevent self-transfer: check if this account belongs to the current user
        const isOwnAccount = accounts.some(a => a.accountNumber === accNum && a.userId === user?.id);
        if (isOwnAccount) {
          setAccountLookup({ status: 'invalid', message: 'This is your own account. Cannot transfer to self.' });
        } else {
          setAccountLookup({
            status: 'valid',
            ownerName: result.ownerName,
            ownerEmail: result.ownerEmail,
          });
        }
      } else {
        setAccountLookup({
          status: 'invalid',
          message: 'Account not found. Please verify the account number. Only registered NeoBank accounts can receive transfers.',
        });
      }
    } catch (err) {
      setAccountLookup({ status: 'idle' });
    }
  }, [accounts, user]);

  // Debounced account lookup as user types
  const handleManualAccountChange = (value: string) => {
    setManualAccountNum(value);
    if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
    if (!value || value.length < 4) {
      setAccountLookup({ status: 'idle' });
      return;
    }
    setAccountLookup({ status: 'checking' });
    lookupTimeoutRef.current = setTimeout(() => {
      validateAccountNumber(value);
    }, 600);
  };

  const loadData = useCallback(async (u: User, preserveSelection: boolean = false) => {
    try {
      const [accs, bens] = await Promise.all([
        getAccounts(),
        getBeneficiaries(),
      ]);
      const activeAccs = accs.filter(a => a.userId === u.id && a.status === 'active');
      const userBens = bens.filter(b => b.userId === u.id);
      setAccounts(activeAccs);
      setBeneficiaries(userBens);
      // Preserve selected account if it's still valid, otherwise pick first
      if (!preserveSelection || !activeAccs.find(a => a.id === fromAccountId)) {
        if (activeAccs.length > 0) setFromAccountId(activeAccs[0].id);
      }
    } catch (err) {
      console.error('Failed to load transfer data:', err);
    } finally {
      setLoading(false);
    }
  }, [fromAccountId]);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    loadData(u);
  }, []);

  // Re-fetch account data whenever refreshKey changes (triggered by deposits/transfers elsewhere)
  useEffect(() => {
    if (user && step === 'form') {
      loadData(user, true);
    }
  }, [refreshKey, step, user, loadData]);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const selectedBeneficiary = beneficiaries.find(b => b.id === toBeneficiaryId);
  const transferAmount = parseFloat(amount);
  // Compute the new balance directly so the success screen shows accurate data immediately
  const newBalance = initialBalance !== null ? initialBalance - (completedTx?.amount ?? 0) : fromAccount?.balance ?? 0;

  const validate = () => {
    if (!fromAccountId) { toast.error('Please select a source account.'); return false; }
    if (!amount || isNaN(transferAmount) || transferAmount <= 0) { toast.error('Please enter a valid amount.'); return false; }
    if (fromAccount && transferAmount > fromAccount.balance) { toast.error('Insufficient funds.'); return false; }
    if (transferAmount < 1) { toast.error('Minimum transfer amount is ₹1.00'); return false; }
    if (transferType === 'beneficiary' && !toBeneficiaryId) { toast.error('Please select a beneficiary.'); return false; }
    if (transferType === 'manual' && !manualAccountNum) { toast.error('Please enter the account number.'); return false; }
    if (transferType === 'manual' && accountLookup.status !== 'valid') {
      toast.error('Destination account is not verified. Please enter a valid registered account number.');
      return false;
    }
    return true;
  };

  const handleReview = () => { if (validate()) setStep('review'); };

  const handleConfirm = async () => {
    setProcessing(true);
    // Save the current balance before the transfer for display comparison
    if (fromAccount) setInitialBalance(fromAccount.balance);
    
    try {
      const result = await transfer({
        fromAccountId,
        toBeneficiaryId: transferType === 'beneficiary' ? toBeneficiaryId : undefined,
        toAccountNumber: transferType === 'manual' ? manualAccountNum : undefined,
        amount: transferAmount,
        description: description || 'Fund transfer',
      });

      if (result.success && result.transaction) {
        setCompletedTx(result.transaction);
        setStep('success');
        toast.success('Transfer completed successfully!');
        triggerRefresh();
        // Immediately reload accounts to reflect updated balances
        if (user) {
          setTimeout(() => loadData(user, true), 300);
        }
      } else {
        toast.error(result.error || 'Transfer failed.');
        setStep('form');
      }
    } catch (err) {
      toast.error('Transfer failed. Please try again.');
      setStep('form');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    setStep('form');
    setAmount('');
    setDescription('');
    setToBeneficiaryId('');
    setManualAccountNum('');
    setInitialBalance(null);
    // Data reload is handled by the refreshKey/step useEffect above
  };

  if (loading) {
    return (
      <AppLayout title="Transfer Funds" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Transfer Funds" subtitle="Send money to beneficiaries or any account">
      <div className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['form', 'review', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'gradient-primary text-white shadow-md' :
                (step === 'review' && i === 0) || step === 'success' ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {(step === 'review' && i === 0) || step === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block capitalize ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                {s === 'form' ? 'Details' : s}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 w-8 rounded-full ${(step === 'review' && i === 0) || step === 'success' ? 'bg-green-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 animate-slide-up">
            {/* From Account */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">From Account</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {accounts.map(acc => (
                  <AccountCard key={acc.id} account={acc} selected={fromAccountId === acc.id} onClick={() => setFromAccountId(acc.id)} />
                ))}
              </div>
              {fromAccount && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Available: <span className="font-semibold text-foreground">{formatCurrency(fromAccount.balance)}</span>
                </p>
              )}
            </div>

            {/* Transfer Type */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Transfer To</h3>
              <div className="flex gap-2 p-1 bg-muted rounded-xl mb-4">
                {(['beneficiary', 'manual'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTransferType(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${transferType === t ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t === 'beneficiary' ? 'Saved Beneficiary' : 'Account Number'}
                  </button>
                ))}
              </div>

              {transferType === 'beneficiary' ? (
                <div className="relative">
                  <select
                    value={toBeneficiaryId}
                    onChange={e => setToBeneficiaryId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">— Select beneficiary —</option>
                    {beneficiaries.map(b => (
                      <option key={b.id} value={b.id}>{b.nickname} — {b.name} ({b.bankName})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={manualAccountNum}
                      onChange={e => handleManualAccountChange(e.target.value)}
                      placeholder="Account number (e.g. 1234-5678-9012-3456)"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
                        accountLookup.status === 'valid'
                          ? 'border-green-400 focus:ring-green-200 focus:border-green-400'
                          : accountLookup.status === 'invalid'
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                            : 'border-border focus:ring-primary/30 focus:border-primary'
                      }`}
                    />
                    {accountLookup.status === 'checking' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                      </div>
                    )}
                    {accountLookup.status === 'valid' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    {accountLookup.status === 'invalid' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {/* Validation feedback */}
                  {accountLookup.status === 'valid' && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong className="font-semibold">{accountLookup.ownerName}</strong>
                        <span className="text-green-500"> · {accountLookup.ownerEmail}</span>
                      </span>
                    </div>
                  )}
                  {accountLookup.status === 'invalid' && (
                    <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{accountLookup.message}</span>
                    </div>
                  )}
                  {accountLookup.status === 'idle' && manualAccountNum.length > 0 && manualAccountNum.length < 4 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Continue typing to verify account...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-border rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 2500].map(preset => (
                  <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="text-xs px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg font-medium transition-colors">
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description (optional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Rent for June 2024"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <button
              onClick={handleReview}
              className="w-full gradient-primary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Review Transfer
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm animate-slide-up">
            <h2 className="font-heading font-bold text-lg mb-5">Confirm Transfer</h2>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 mb-6">
              {[
                { label: 'From', value: fromAccount ? `${fromAccount.accountNumber.slice(-8)} (${fromAccount.accountType})` : '—' },
                { label: 'To', value: selectedBeneficiary ? `${selectedBeneficiary.name} — ${selectedBeneficiary.bankName}` : manualAccountNum || '—' },
                { label: 'Amount', value: formatCurrency(transferAmount), highlight: true },
                { label: 'Description', value: description || 'Fund transfer' },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className={`text-sm font-semibold ${highlight ? 'text-primary text-lg' : 'text-foreground'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="flex-2 flex-grow gradient-primary text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg shadow-blue-500/20"
              >
                {processing ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm & Send</>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && completedTx && (
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center animate-slide-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground mb-1">Transfer Successful!</h2>
            <p className="text-muted-foreground text-sm mb-6">Your funds have been sent successfully.</p>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference</span>
                <span className="text-sm font-mono font-semibold">{completedTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(completedTx.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm font-semibold">{completedTx.beneficiaryName}</span>
              </div>
            </div>
            {/* Balance impact summary — uses computed values so it's accurate immediately */}
            {fromAccount && initialBalance !== null && (
              <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-left mb-6 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Balance Update</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    Previous Balance
                  </span>
                  <span className="font-semibold">{formatCurrency(initialBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                    Transferred
                  </span>
                  <span className="font-semibold text-red-500">-{formatCurrency(completedTx.amount)}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    Current Balance
                  </span>
                  <span className="font-bold text-green-600 text-base">{formatCurrency(newBalance)}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleReset}
              className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Make Another Transfer
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
