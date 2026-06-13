import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAccounts } from '@/services/accountService';
import { selfDeposit } from '@/services/transactionService';
import { requireAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/mockData';
import { useDataRefresh } from '@/contexts/DataRefreshContext';
import TransactionReceipt from '@/components/features/TransactionReceipt';
import { toast } from 'sonner';
import { 
  Wallet, 
  Banknote, 
  ArrowDownToLine, 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  PiggyBank, 
  Building2, 
  Receipt
} from 'lucide-react';
import type { Account, User, Transaction } from '@/types';

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

const accountIcons: Record<string, React.ReactNode> = {
  savings: <PiggyBank className="h-5 w-5" />,
  checking: <CreditCard className="h-5 w-5" />,
  fixed_deposit: <Building2 className="h-5 w-5" />,
};

export default function Deposit() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Self deposit');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { triggerRefresh } = useDataRefresh();
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState<Transaction | null>(null);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    getAccounts().then(accs => {
      setAccounts(accs.filter(a => a.status === 'active'));
      if (accs.length > 0) setSelectedAccount(accs[0].id);
      setPageLoading(false);
    }).catch(() => setPageLoading(false));
  }, []);

  const account = accounts.find(a => a.id === selectedAccount);
  const parsedAmount = parseFloat(amount);
  const isValid = selectedAccount && parsedAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !selectedAccount) return;
    setLoading(true);
    const result = await selfDeposit({
      accountId: selectedAccount,
      amount: parsedAmount,
      description,
    });
    if (result.success && result.transaction) {
      setSuccess(result.transaction);                      toast.success(`₹${parsedAmount.toLocaleString('en-IN')} deposited successfully!`);
      triggerRefresh();
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error(result.error || 'Deposit failed');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSuccess(null);
    setAmount('');
    setDescription('Self deposit');
    getAccounts().then(accs => setAccounts(accs.filter(a => a.status === 'active')));
  };

  if (pageLoading) {
    return (
      <AppLayout title="Deposit" subtitle="Add funds to your account">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Deposit Funds" subtitle="Add money to your accounts securely">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-lg mx-auto space-y-6"
          >
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
              <CardContent className="pt-6 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Deposit Successful!</h2>
                  <p className="text-green-400 text-3xl font-bold mt-2">
                    ₹{parsedAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-400 mt-1">
                    Added to {account?.accountType.charAt(0).toUpperCase() + account?.accountType.slice(1).replace('_', ' ')} Account
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ref: {success.reference || success.id?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <TransactionReceipt transaction={success} />
                  <Button onClick={resetForm} variant="outline" className="border-gray-600">
                    <Banknote className="h-4 w-4 mr-2" />
                    Make Another Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Account Selection */}
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  Select Account
                </CardTitle>
                <CardDescription>Choose the account to deposit into</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accounts.map(acc => (
                    <motion.button
                      key={acc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAccount(acc.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedAccount === acc.id
                          ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          selectedAccount === acc.id ? 'bg-blue-500/20' : 'bg-gray-700/50'
                        }`}>
                          {accountIcons[acc.accountType] || <CreditCard className="h-5 w-5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {acc.accountType.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-400">****{acc.accountNumber?.slice(-4)}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(acc.balance)}</p>
                    </motion.button>
                  ))}
                </div>
                {accounts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No active accounts found</p>
                )}
              </CardContent>
            </Card>

            {/* Amount & Details */}
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-green-400" />
                  Deposit Amount
                </CardTitle>
                <CardDescription>Enter the amount you want to deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Amounts */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(qa => (
                    <Button
                      key={qa}
                      type="button"
                      variant={parsedAmount === qa ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAmount(qa.toString())}
                      className={parsedAmount === qa ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
                    >
                      ₹{qa.toLocaleString('en-IN')}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">₹</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="pl-8 h-14 text-2xl font-bold bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What's this deposit for?"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                    rows={2}
                  />
                </div>

                {account && (
                  <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Balance</span>
                      <span className="text-white font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">After Deposit</span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(account.balance + (parsedAmount || 0))}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><ArrowDownToLine className="h-5 w-5 mr-2" /> Deposit ₹{parsedAmount ? parsedAmount.toLocaleString('en-IN') : '0.00'}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
