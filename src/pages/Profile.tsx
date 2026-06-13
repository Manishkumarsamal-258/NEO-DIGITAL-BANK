import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { requireAuth } from '@/lib/auth';
import { getProfile, updateProfile, changePassword } from '@/services/userService';
import { getAccounts } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { formatCurrency } from '@/lib/mockData';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import type { User } from '@/types';
import { User as UserIcon, Phone, MapPin, Mail, Shield, Edit2, CheckCircle2, Key, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    loadData(u);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [profile, txns, accs] = await Promise.all([
        getProfile(),
        getTransactions(),
        getAccounts(),
      ]);
      setUser(profile);
      setForm({ name: profile.name, phone: profile.phone, address: profile.address });
      const userTxns = txns.filter(t => t.userId === profile.id);
      const userAccs = accs.filter(a => a.userId === profile.id);
      setTxCount(userTxns.length);
      setTotalBalance(userAccs.reduce((s, a) => s + a.balance, 0));
      setAccountCount(userAccs.length);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 15000);

  const handleSave = async () => {
    if (!form.name || !form.phone) { toast.error('Name and phone are required.'); return; }
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      localStorage.setItem('neobank_user', JSON.stringify(updated));
      setEditing(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.next) { toast.error('Fill in all password fields.'); return; }
    if (passwordForm.next !== passwordForm.confirm) { toast.error('New passwords do not match.'); return; }
    if (passwordForm.next.length < 8) { toast.error('Password must be at least 8 characters.'); return; }

    const result = await changePassword(passwordForm.current, passwordForm.next);
    if (result.success) {
      setPasswordForm({ current: '', next: '', confirm: '' });
      setShowPasswordChange(false);
      toast.success('Password changed successfully.');
    } else {
      toast.error(result.error || 'Failed to change password.');
    }
  };

  if (loading || !user) {
    return (
      <AppLayout title="My Profile" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const roleColor = user.role === 'admin' ? 'text-red-600 bg-red-50 border-red-200' : user.role === 'teller' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal information and security">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Profile Hero */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-24 gradient-primary" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl gradient-navy border-4 border-white flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg">
                {user.avatarInitials}
              </div>
              <div className="mb-2">
                <h2 className="font-heading font-bold text-xl text-foreground">{user.name}</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${roleColor}`}>{user.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { label: 'Accounts', value: accountCount },
                { label: 'Transactions', value: txCount },
                { label: 'Total Balance', value: formatCurrency(totalBalance) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-heading font-bold text-lg text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-base text-foreground">Personal Information</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${editing ? 'gradient-primary text-white shadow-md' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {editing ? <><CheckCircle2 className="w-3.5 h-3.5" /> Save</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Full Name', field: 'name', icon: UserIcon, value: form.name },
              { label: 'Phone Number', field: 'phone', icon: Phone, value: form.phone },
              { label: 'Address', field: 'address', icon: MapPin, value: form.address },
            ].map(({ label, field, icon: Icon, value }) => (
              <div key={field}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </label>
                {editing ? (
                  <input
                    value={value}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{value || '—'}</p>
                )}
              </div>
            ))}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <p className="text-sm text-foreground font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed.</p>
            </div>
          </div>
          {editing && (
            <button onClick={() => setEditing(false)} className="mt-4 w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
          )}
        </div>

        {/* Security */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-base text-foreground">Security</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Change your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <Key className="w-3.5 h-3.5" /> Change
              </button>
            </div>
            {showPasswordChange && (
              <div className="space-y-3 pt-2">
                {[
                  { field: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                  { field: 'next', label: 'New Password', placeholder: 'Min. 8 characters' },
                  { field: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                    <input
                      type="password"
                      value={passwordForm[field as keyof typeof passwordForm]}
                      onChange={e => setPasswordForm(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
                <button onClick={handlePasswordChange} className="w-full gradient-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
                  Update Password
                </button>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Account Status</p>
                <p className="text-xs text-muted-foreground">Member since {user.createdAt}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
