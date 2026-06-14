import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { requireAuth } from '@/lib/auth';
import {
  getAllUsers, toggleUserStatus, getAllTransactions, getAllAccounts,
  getAllKyc, getPendingKyc, verifyKyc, rejectKyc, getKycStats,
  createUser, updateUser, deleteUser
} from '@/services/adminService';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import type { User, Transaction, Account, KycDocument } from '@/types';
import {
  Users, AlertTriangle, ShieldCheck, Activity, Search,
  CheckCircle2, XCircle, Ban, RefreshCw, Eye, Loader2,
  FileText, Fingerprint, ShieldAlert, UserCheck, IdCard,
  Clock, ThumbsUp, ThumbsDown, MessageSquare, X, Pencil, Trash2, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'users' | 'kyc' | 'failed_txns' | 'risk';

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  AADHAR: 'bg-orange-100 text-orange-700',
  PAN: 'bg-blue-100 text-blue-700',
  VOTER_ID: 'bg-purple-100 text-purple-700',
  DRIVING_LICENSE: 'bg-cyan-100 text-cyan-700',
  PASSPORT: 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  verified: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminConsole() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [kycDocs, setKycDocs] = useState<KycDocument[]>([]);
  const [kycStats, setKycStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // User CRUD state
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', phone: '', address: '',
    role: 'customer' as string, status: 'active' as string
  });

  // KYC state
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [kycDocToReview, setKycDocToReview] = useState<KycDocument | null>(null);
  const [rejectModal, setRejectModal] = useState<KycDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [u, t, a, k, ks] = await Promise.all([
        getAllUsers(),
        getAllTransactions(),
        getAllAccounts(),
        getAllKyc(),
        getKycStats(),
      ]);
      setUsers(u);
      setTransactions(t);
      setAccounts(a);
      setKycDocs(k);
      setKycStats(ks);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = requireAuth();
    if (!u || u.role !== 'admin') return;
    loadData();
  }, []);

  // Real-time: poll every 10s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 10000);

  const failedTxns = transactions.filter(t => t.status === 'failed');
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const updated = await toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      setSelectedUser(prev => prev?.id === userId ? updated : prev);
      toast.success('User status updated.');
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  // ── Admin CRUD Handlers ──────────────────────────────────────────────

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    setActionLoading('create');
    try {
      const newUser = await createUser(userForm);
      setUsers(prev => [...prev, newUser]);
      setShowAddUser(false);
      setUserForm({ name: '', email: '', password: '', phone: '', address: '', role: 'customer', status: 'active' });
      toast.success(`User ${newUser.name} created successfully.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!showEditUser) return;
    setActionLoading('update');
    try {
      const updated = await updateUser(showEditUser.id, userForm);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setSelectedUser(prev => prev?.id === updated.id ? updated : prev);
      setShowEditUser(null);
      toast.success(`User ${updated.name} updated successfully.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    setActionLoading('delete');
    try {
      await deleteUser(deleteConfirm.id);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
      setSelectedUser(prev => prev?.id === deleteConfirm.id ? null : prev);
      toast.success(`User ${deleteConfirm.name} deleted.`);
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditUser = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone,
      address: user.address || '',
      role: user.role,
      status: user.status,
    });
    setShowEditUser(user);
  };

  const openAddUser = () => {
    setUserForm({ name: '', email: '', password: '', phone: '', address: '', role: 'customer', status: 'active' });
    setShowAddUser(true);
  };

  const getUserAccounts = (userId: string) => accounts.filter(a => a.userId === userId);
  const getTotalBalance = (userId: string) => getUserAccounts(userId).reduce((s, a) => s + a.balance, 0);

  const riskUsers = users.filter(u => {
    const userTxns = transactions.filter(t => t.userId === u.id);
    const failedCount = userTxns.filter(t => t.status === 'failed').length;
    return failedCount >= 1;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    failedTxns: failedTxns.length,
    totalVolume: transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0),
    riskAccounts: riskUsers.length,
    pendingKyc: kycStats.pending,
    verifiedKyc: kycStats.verified,
    rejectedKyc: kycStats.rejected,
  };

  // ── KYC Functions ──────────────────────────────────────────────────────────

  const filteredKycDocs = kycDocs.filter(doc => {
    if (kycFilter === 'all') return true;
    return doc.status === kycFilter;
  });

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const handleVerifyKyc = async (kycId: string) => {
    setActionLoading(kycId);
    try {
      const updated = await verifyKyc(kycId);
      setKycDocs(prev => prev.map(d => d.id === kycId ? updated : d));
      setKycDocToReview(null);
      // Refresh stats
      const ks = await getKycStats();
      setKycStats(ks);
      toast.success('KYC document verified successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to verify KYC.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      const updated = await rejectKyc(rejectModal.id, rejectReason);
      setKycDocs(prev => prev.map(d => d.id === rejectModal.id ? updated : d));
      setRejectModal(null);
      setRejectReason('');
      // Refresh stats
      const ks = await getKycStats();
      setKycStats(ks);
      toast.success('KYC document rejected.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject KYC.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Admin Console" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Admin Console" subtitle="System administration and risk management">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
            { label: 'Active', value: stats.activeUsers, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
            { label: 'Suspended', value: stats.suspended, color: 'text-red-500', bg: 'bg-red-50', icon: Ban },
            { label: 'Pending KYC', value: stats.pendingKyc, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
            { label: 'Verified KYC', value: stats.verifiedKyc, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: UserCheck },
            { label: 'Failed Txns', value: stats.failedTxns, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
            { label: 'Total Volume', value: formatCurrency(stats.totalVolume), color: 'text-purple-600', bg: 'bg-purple-50', icon: Activity },
          ].map(({ label, value, color, bg, icon: Icon }) => (              <div key={label} className={`${bg} border border-border/50 rounded-2xl p-4 animate-slide-up`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
              <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit flex-wrap">
          {([
            { key: 'users', label: 'User Management', icon: Users },
            { key: 'kyc', label: 'KYC Verification', icon: IdCard, badge: kycStats.pending },
            { key: 'failed_txns', label: 'Failed Transactions', icon: AlertTriangle },
            { key: 'risk', label: 'Risk Monitor', icon: ShieldCheck },
          ] as { key: Tab; label: string; icon: typeof Users; badge?: number }[]).map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === key ? 'bg-yellow-100 text-yellow-700' : 'bg-muted-foreground/10 text-muted-foreground'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ==================== USER MANAGEMENT TAB ==================== */}
        {tab === 'users' && (
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                  className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
                />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="teller">Teller</option>
                <option value="admin">Admin</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              {/* Add User Button */}
              <button
                onClick={openAddUser}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              {tab === 'users' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    {filteredUsers.reduce((count, u) => count + kycDocs.filter(k => k.userId === u.id && k.status === 'pending').length, 0)} pending KYC
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['User', 'Role', 'Status', 'KYC', 'Accounts', 'Total Balance', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.map(u => {
                    const userAccs = getUserAccounts(u.id);
                    const userKycDocs = kycDocs.filter(k => k.userId === u.id);
                    const hasVerifiedKyc = userKycDocs.some(k => k.status === 'verified');
                    const hasPendingKyc = userKycDocs.some(k => k.status === 'pending');
                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.avatarInitials}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                            u.role === 'teller' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-semibold w-fit ${u.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                            {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {userKycDocs.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : hasVerifiedKyc ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : hasPendingKyc ? (
                              <button
                                onClick={() => { setTab('kyc'); setKycFilter('pending'); }}
                                className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-lg hover:bg-yellow-100 transition-colors"
                                title="View pending KYC"
                              >
                                <Clock className="w-3 h-3" /> Pending
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{userAccs.length}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(getTotalBalance(u.id))}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.createdAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* KYC Action Button */}
                            {userKycDocs.length > 0 && hasPendingKyc ? (
                              <button
                                onClick={() => {
                                  const pendingDoc = userKycDocs.find(k => k.status === 'pending');
                                  if (pendingDoc) setKycDocToReview(pendingDoc);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                title="Review KYC document"
                              >
                                <IdCard className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">KYC</span>
                              </button>
                            ) : userKycDocs.length > 0 && hasVerifiedKyc ? (
                              <button
                                onClick={() => {
                                  const verifiedDoc = userKycDocs.find(k => k.status === 'verified');
                                  if (verifiedDoc) setKycDocToReview(verifiedDoc);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="View KYC details"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">KYC</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  // Show the user detail modal with KYC section
                                  setSelectedUser(u);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                title="KYC not submitted"
                              >
                                <IdCard className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">KYC</span>
                              </button>
                            )}

                            {/* View Details */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit User */}
                            <button
                              onClick={() => openEditUser(u)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Edit user"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {/* Delete User */}
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => setDeleteConfirm(u)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Delete this user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            )}

                            {/* Suspend/Activate */}
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                                title={u.status === 'active' ? 'Suspend this user' : 'Activate this user'}
                              >
                                {u.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== KYC VERIFICATION TAB ==================== */}
        {tab === 'kyc' && (
          <div className="space-y-4">
            {/* KYC Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pending', value: kycStats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
                { label: 'Verified', value: kycStats.verified, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                { label: 'Rejected', value: kycStats.rejected, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} className={`${bg} border border-border/50 rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  </div>
                  <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* KYC Description Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
              <Fingerprint className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-800">KYC Document Verification</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Review customer identity documents (Aadhaar, PAN, Voter ID, Driving License, Passport).
                  Verify document authenticity and approve or reject with remarks.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: kycDocs.length },
                { key: 'pending', label: 'Pending', count: kycStats.pending },
                { key: 'verified', label: 'Verified', count: kycStats.verified },
                { key: 'rejected', label: 'Rejected', count: kycStats.rejected },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setKycFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    kycFilter === key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* KYC Documents List */}
            {filteredKycDocs.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
                <IdCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-foreground">No KYC documents found</p>
                <p className="text-sm text-muted-foreground mt-1">All customer documents have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKycDocs.map(doc => {
                  const user = getUserById(doc.userId);
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Document Icon */}
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <IdCard className="w-6 h-6 text-indigo-600" />
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DOCUMENT_TYPE_COLORS[doc.documentType] || 'bg-gray-100 text-gray-700'}`}>
                              {doc.documentType}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Submitted {formatDate(doc.submittedAt)}
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Document No:</span>
                              <p className="font-mono font-semibold text-foreground text-xs">{doc.documentNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Customer</span>
                              <p className="font-semibold text-foreground text-sm">{user?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Email</span>
                              <p className="text-foreground text-xs truncate">{user?.email || '—'}</p>
                            </div>
                          </div>

                          {/* Remarks for rejected docs */}
                          {doc.remarks && doc.status === 'rejected' && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{doc.remarks}</span>
                            </div>
                          )}

                          {/* Verification info */}
                          {(doc.verifiedAt && doc.verifiedBy) && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {doc.status === 'verified' ? 'Verified' : 'Reviewed'} on {formatDate(doc.verifiedAt)}
                              {doc.verifiedBy && ` by ${getUserById(doc.verifiedBy)?.name || doc.verifiedBy}`}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setKycDocToReview(doc)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyKyc(doc.id)}
                                disabled={actionLoading === doc.id}
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                title="Verify document"
                              >
                                {actionLoading === doc.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setRejectModal(doc)}
                                disabled={actionLoading === doc.id}
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Reject document"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== FAILED TRANSACTIONS TAB ==================== */}
        {tab === 'failed_txns' && (
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-heading font-semibold text-base text-foreground">Failed Transactions ({failedTxns.length})</h3>
              <span className="text-xs text-muted-foreground">Requires investigation</span>
            </div>
            {failedTxns.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-medium text-foreground">All clear!</p>
                <p className="text-sm text-muted-foreground mt-1">No failed transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Reference', 'User', 'Amount', 'Description', 'Date', 'Beneficiary'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {failedTxns.map(tx => {
                      const txUser = users.find(u => u.id === tx.userId);
                      return (
                        <tr key={tx.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.reference}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground text-xs">{txUser?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{txUser?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-red-500">{formatCurrency(tx.amount)}</td>
                          <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{tx.description}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-foreground">{tx.beneficiaryName || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== RISK MONITOR TAB ==================== */}
        {tab === 'risk' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Risk Assessment Active</p>
                <p className="text-xs text-amber-700 mt-0.5">Users with failed transactions or suspicious patterns are flagged below.</p>
              </div>
            </div>
            {riskUsers.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
                <ShieldCheck className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-medium text-foreground">No risk flags detected</p>
                <p className="text-sm text-muted-foreground mt-1">All user accounts appear normal.</p>
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-border/50">
                  {riskUsers.map(u => {
                    const userTxns = transactions.filter(t => t.userId === u.id);
                    const failedCount = userTxns.filter(t => t.status === 'failed').length;
                    const totalAmt = userTxns.reduce((s, t) => s + t.amount, 0);
                    const riskLevel = failedCount >= 3 ? 'High' : failedCount >= 2 ? 'Medium' : 'Low';
                    const riskColor = riskLevel === 'High' ? 'text-red-600 bg-red-50 border-red-200' : riskLevel === 'Medium' ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
                    return (
                      <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {u.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Failed</p>
                          <p className="font-bold text-red-500">{failedCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Volume</p>
                          <p className="font-bold text-foreground text-sm">{formatCurrency(totalAmt)}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskColor}`}>{riskLevel} Risk</span>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── User Detail Modal ────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-base">
                  {selectedUser.avatarInitials}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{selectedUser.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                      selectedUser.role === 'admin' ? 'bg-red-100 text-red-700' :
                      selectedUser.role === 'teller' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{selectedUser.role}</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      selectedUser.status === 'active' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {selectedUser.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              {[
                { label: 'Phone', value: selectedUser.phone },
                { label: 'Address', value: selectedUser.address || '—' },
                { label: 'Member Since', value: selectedUser.createdAt },
                { label: 'Accounts', value: String(getUserAccounts(selectedUser.id).length) },
                { label: 'Total Balance', value: formatCurrency(getTotalBalance(selectedUser.id)) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/50 rounded-xl px-3 py-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-foreground truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* ── Admin Actions ────────────────────────────────────── */}
            <div className="border border-border rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Admin Actions</p>
              <div className="flex flex-wrap gap-2">
                {/* Suspend/Activate Action */}
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleUserStatus(selectedUser.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedUser.status === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {selectedUser.status === 'active' ? <Ban className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                  </button>
                )}

                {/* KYC Action - navigate to KYC tab */}
                <button
                  onClick={() => {
                    const userKyc = kycDocs.filter(k => k.userId === selectedUser.id);
                    if (userKyc.length > 0) {
                      const pendingDoc = userKyc.find(k => k.status === 'pending');
                      if (pendingDoc) {
                        setKycDocToReview(pendingDoc);
                      } else {
                        setKycDocToReview(userKyc[0]);
                      }
                    } else {
                      setSelectedUser(null);
                      setTab('kyc');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    kycDocs.some(k => k.userId === selectedUser.id && k.status === 'pending')
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      : kycDocs.some(k => k.userId === selectedUser.id && k.status === 'verified')
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <IdCard className="w-4 h-4" />
                  {kycDocs.some(k => k.userId === selectedUser.id && k.status === 'pending')
                    ? 'Review KYC'
                    : kycDocs.some(k => k.userId === selectedUser.id && k.status === 'verified')
                      ? 'View KYC'
                      : 'No KYC Submitted'
                  }
                </button>
              </div>
            </div>

            {/* ── KYC Documents Section ────────────────────────────── */}
            <div className="border border-border rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                KYC Documents ({kycDocs.filter(k => k.userId === selectedUser.id).length})
              </p>
              {(() => {
                const userKycDocs = kycDocs.filter(k => k.userId === selectedUser.id);
                if (userKycDocs.length === 0) {
                  return (
                    <div className="text-center py-4">
                      <IdCard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No KYC documents submitted yet.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {userKycDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          doc.status === 'verified' ? 'bg-emerald-100' :
                          doc.status === 'rejected' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            doc.status === 'verified' ? 'text-emerald-600' :
                            doc.status === 'rejected' ? 'text-red-500' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${DOCUMENT_TYPE_COLORS[doc.documentType] || 'bg-gray-100 text-gray-700'}`}>
                              {doc.documentType}
                            </span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[doc.status]}`}>
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-foreground mt-0.5">{doc.documentNumber}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setKycDocToReview(doc)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleVerifyKyc(doc.id); }}
                                disabled={actionLoading === doc.id}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                title="Verify"
                              >
                                {actionLoading === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => { setRejectModal(doc); }}
                                disabled={actionLoading === doc.id}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── KYC Review Modal ──────────────────────────────────────────── */}
      {kycDocToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setKycDocToReview(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                KYC Document Review
              </h3>
              <button onClick={() => setKycDocToReview(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${DOCUMENT_TYPE_COLORS[kycDocToReview.documentType] || 'bg-gray-100 text-gray-700'}`}>
                    {kycDocToReview.documentType}
                  </span>
                  <p className="font-mono font-bold text-lg text-foreground mt-1">{kycDocToReview.documentNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-semibold text-foreground">{getUserById(kycDocToReview.userId)?.name || 'Unknown'}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground text-xs truncate">{getUserById(kycDocToReview.userId)?.email || '—'}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-semibold text-foreground">{formatDate(kycDocToReview.submittedAt)}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${STATUS_COLORS[kycDocToReview.status]}`}>
                    {kycDocToReview.status.charAt(0).toUpperCase() + kycDocToReview.status.slice(1)}
                  </span>
                </div>
              </div>

              {kycDocToReview.documentImageUrl && (
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1">Document Image</p>
                  <div className="px-3 pb-3">
                    <div
                      onClick={() => window.open(kycDocToReview.documentImageUrl, '_blank')}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border bg-white"
                    >
                      <img
                        src={kycDocToReview.documentImageUrl}
                        alt={`${kycDocToReview.documentType} document`}
                        className="w-full h-56 object-contain bg-white p-2"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-lg">
                          Click to view full size
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {kycDocToReview.remarks && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{kycDocToReview.remarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              {kycDocToReview.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { handleVerifyKyc(kycDocToReview.id); }}
                    disabled={actionLoading === kycDocToReview.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
                  >
                    {actionLoading === kycDocToReview.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="w-4 h-4" />
                    )}
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => { setRejectModal(kycDocToReview); setKycDocToReview(null); }}
                    disabled={actionLoading === kycDocToReview.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {/* Suspend user action on KYC review */}
              {(() => {
                const kycUser = getUserById(kycDocToReview.userId);
                if (!kycUser || kycUser.role === 'admin') return null;
                return (
                  <div className="border-t border-border pt-3 mt-3">
                    <button
                      onClick={() => {
                        setKycDocToReview(null);
                        handleToggleUserStatus(kycUser.id);
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        kycUser.status === 'active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {kycUser.status === 'active' ? <Ban className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      {kycUser.status === 'active' ? `Suspend ${kycUser.name.split(' ')[0]}` : `Activate ${kycUser.name.split(' ')[0]}`}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject KYC Modal ──────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Reject KYC Document
              </h3>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Provide a reason for rejecting this {rejectModal.documentType} document
              (<span className="font-mono font-semibold">{rejectModal.documentNumber}</span>)
              submitted by <strong>{getUserById(rejectModal.userId)?.name || 'Unknown'}</strong>.
            </p>

            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., Document unclear, number mismatch, expired)..."
              className="w-full border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 min-h-[100px] resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKyc}
                disabled={actionLoading === rejectModal.id || !rejectReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors"
              >
                {actionLoading === rejectModal.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsDown className="w-4 h-4" />
                )}
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────── */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddUser(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Add New User
              </h3>
              <button onClick={() => setShowAddUser(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name *</label>
                  <input
                    value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email *</label>
                  <input
                    value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="john@example.com" type="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Password *</label>
                  <input
                    value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Min 8 chars" type="password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone</label>
                  <input
                    value={userForm.phone} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="+1 555-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Role</label>
                  <select
                    value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="customer">Customer</option>
                    <option value="teller">Teller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                  <select
                    value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Address</label>
                  <input
                    value={userForm.address} onChange={e => setUserForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={actionLoading === 'create'}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────────── */}
      {showEditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowEditUser(null); }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                Edit User
              </h3>
              <button onClick={() => setShowEditUser(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                {showEditUser.avatarInitials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{showEditUser.name}</p>
                <p className="text-xs text-muted-foreground">{showEditUser.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                  <input
                    value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                  <input
                    value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">New Password (leave blank to keep)</label>
                  <input
                    value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    type="password" placeholder="Leave blank to keep"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone</label>
                  <input
                    value={userForm.phone} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Role</label>
                  <select
                    value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="customer">Customer</option>
                    <option value="teller">Teller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                  <select
                    value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Address</label>
                  <input
                    value={userForm.address} onChange={e => setUserForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditUser(null)}
                  className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={actionLoading === 'update'}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === 'update' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirmation Modal ───────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">Delete User</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800 font-semibold">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <p className="text-xs text-amber-700 mt-1">
                This will permanently remove the user account, all their accounts, transactions, and KYC data.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                {deleteConfirm.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{deleteConfirm.name}</p>
                <p className="text-xs text-muted-foreground">{deleteConfirm.email} · {deleteConfirm.role}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === 'delete'}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
