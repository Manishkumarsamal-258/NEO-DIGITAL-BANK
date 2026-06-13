import type { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/mockData';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import TransactionReceipt from '@/components/features/TransactionReceipt';

interface TransactionRowProps {
  transaction: Transaction;
}

const categoryColors: Record<string, string> = {
  Income: 'bg-green-100 text-green-700',
  Housing: 'bg-blue-100 text-blue-700',
  Groceries: 'bg-orange-100 text-orange-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Finance: 'bg-red-100 text-red-700',
  Personal: 'bg-pink-100 text-pink-700',
  Electronics: 'bg-cyan-100 text-cyan-700',
  Business: 'bg-indigo-100 text-indigo-700',
  Default: 'bg-gray-100 text-gray-700',
};

export default function TransactionRow({ transaction: tx }: TransactionRowProps) {
  const isCredit = tx.type === 'credit';
  const isFailed = tx.status === 'failed';

  const StatusIcon = {
    completed: CheckCircle2,
    pending: Clock,
    failed: XCircle,
    processing: Loader2,
  }[tx.status];

  const statusColor = {
    completed: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-500',
    processing: 'text-blue-500',
  }[tx.status];

  const TypeIcon = tx.type === 'credit' ? ArrowDownLeft : tx.type === 'debit' ? ArrowUpRight : ArrowLeftRight;
  const typeColor = isCredit ? 'bg-green-100 text-green-700' : isFailed ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700';
  const catColor = categoryColors[tx.category] || categoryColors.Default;

  return (
    <div className="flex items-center gap-3 py-3.5 px-4 hover:bg-muted/40 transition-colors rounded-xl group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor}`}>
        <TypeIcon className="w-4.5 h-4.5" size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
          <span className={`hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${catColor}`}>
            {tx.category}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{formatDateTime(tx.createdAt)}</p>
          <span className="text-muted-foreground/50">·</span>
          <p className="text-xs text-muted-foreground font-mono">{tx.reference}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : isFailed ? 'text-red-500 line-through opacity-60' : 'text-foreground'}`}>
          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
        </p>
        <div className={`flex items-center gap-1 justify-end mt-0.5 text-[11px] font-medium ${statusColor}`}>
          <StatusIcon className={`w-3 h-3 ${tx.status === 'processing' ? 'animate-spin' : ''}`} />
          <span className="capitalize">{tx.status}</span>
            <TransactionReceipt transaction={tx} />
        </div>
      </div>
    </div>
  );
}
