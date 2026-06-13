import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { requireAuth } from '@/lib/auth';
import { getTransactions } from '@/services/transactionService';
import { formatCurrency } from '@/lib/mockData';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import type { Transaction, User } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCw } from 'lucide-react';

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const monthlyData = [
  { month: 'Jan', income: 5200, expense: 3100, net: 2100 },
  { month: 'Feb', income: 4800, expense: 2900, net: 1900 },
  { month: 'Mar', income: 5500, expense: 3400, net: 2100 },
  { month: 'Apr', income: 6000, expense: 2800, net: 3200 },
  { month: 'May', income: 5200, expense: 3200, net: 2000 },
  { month: 'Jun', income: 5350, expense: 2735, net: 2615 },
];

export default function Analytics() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
    loadData(u);
  }, []);

  const loadData = useCallback(async (u?: User) => {
    const currentUser = u || user;
    if (!currentUser) return;
    try {
      const allTx = await getTransactions();
      setTransactions(allTx.filter(t => t.userId === currentUser.id && t.status === 'completed'));
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 15000);

  const categoryMap: Record<string, number> = {};
  transactions.filter(t => t.type !== 'credit').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <AppLayout title="Analytics" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Analytics" subtitle="Insights into your financial activity">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: formatCurrency(totalIncome), color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Expenses', value: formatCurrency(totalExpense), color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Net Savings', value: formatCurrency(totalIncome - totalExpense), color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Savings Rate', value: `${savingsRate}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border border-border/50 rounded-2xl p-5 animate-slide-up`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Bar Chart */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-heading font-bold text-base text-foreground mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#F97316" radius={[4, 4, 0, 0]} name="Expense" />
                <Bar dataKey="net" fill="#10B981" radius={[4, 4, 0, 0]} name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending by Category */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-heading font-bold text-base text-foreground mb-4">Spending by Category</h3>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [formatCurrency(val)]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.slice(0, 6).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <span className="text-xs text-muted-foreground truncate">{cat.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground shrink-0">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-heading font-bold text-base text-foreground mb-4">Financial Insights</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Highest Spend Category', value: categoryData[0]?.name || 'N/A', sub: categoryData[0] ? formatCurrency(categoryData[0].value) : '—', color: 'bg-red-50 border-red-100' },
              { title: 'Transaction Count', value: String(transactions.length), sub: 'Completed this period', color: 'bg-blue-50 border-blue-100' },
              { title: 'Avg Transaction', value: transactions.length > 0 ? formatCurrency((totalIncome + totalExpense) / transactions.length) : '—', sub: 'Per transaction', color: 'bg-green-50 border-green-100' },
            ].map(({ title, value, sub, color }) => (
              <div key={title} className={`p-4 rounded-xl border ${color}`}>
                <p className="text-xs text-muted-foreground mb-1">{title}</p>
                <p className="text-lg font-heading font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
