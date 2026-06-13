import type { Account } from '@/types';
import { formatCurrency } from '@/lib/mockData';
import { CreditCard, TrendingUp, Lock } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  selected?: boolean;
  onClick?: () => void;
}

const typeGradients: Record<string, string> = {
  savings: 'from-[#1E40AF] to-[#3B82F6]',
  checking: 'from-[#1E3A5F] to-[#2563EB]',
  fixed_deposit: 'from-[#4338CA] to-[#7C3AED]',
};

const typeLabels: Record<string, string> = {
  savings: 'Savings Account',
  checking: 'Checking Account',
  fixed_deposit: 'Fixed Deposit',
};

export default function AccountCard({ account, selected, onClick }: AccountCardProps) {
  const gradient = typeGradients[account.accountType] || typeGradients.savings;
  const isFrozen = account.status === 'frozen';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 text-white cursor-pointer transition-all duration-200 overflow-hidden bg-gradient-to-br ${gradient} ${
        selected ? 'ring-2 ring-white ring-offset-2 ring-offset-background shadow-xl scale-[1.01]' : 'hover:scale-[1.01] hover:shadow-lg shadow-md'
      } ${isFrozen ? 'opacity-70' : ''}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">Account Frozen</span>
          </div>
        </div>
      )}

      <div className="relative z-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">{typeLabels[account.accountType]}</p>
            <p className="text-xs text-white/50 font-mono">{account.accountNumber}</p>
          </div>
          <CreditCard className="w-8 h-8 text-white/40" />
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">Available Balance</p>
          <p className="text-2xl font-heading font-bold tracking-tight">{formatCurrency(account.balance)}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/50 capitalize">{account.currency}</span>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <TrendingUp className="w-3 h-3" />
            <span>{account.interestRate}% p.a.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
