import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { requireAuth } from '@/lib/auth';
import { getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary } from '@/services/beneficiaryService';
import { useRealtimeRefresh } from '@/hooks/useRealtimeRefresh';
import type { Beneficiary, User } from '@/types';
import { Plus, Pencil, Trash2, Users2, Building2, CreditCard, X, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BeneficiaryFormData {
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  nickname: string;
}

const emptyForm: BeneficiaryFormData = { name: '', accountNumber: '', bankName: '', ifscCode: '', nickname: '' };

export default function Beneficiaries() {
  const [user, setUser] = useState<User | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BeneficiaryFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const all = await getBeneficiaries();
      setBeneficiaries(all.filter(b => b.userId === user.id));
    } catch (err) {
      console.error('Failed to load beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    setUser(u);
  }, []);

  // Load data when user is set
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Real-time: poll every 15s + refresh on deposits/transfers
  useRealtimeRefresh(loadData, 15000);

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.nickname.toLowerCase().includes(search.toLowerCase()) ||
    b.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const setField = (field: keyof BeneficiaryFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: Beneficiary) => { setEditId(b.id); setForm({ name: b.name, accountNumber: b.accountNumber, bankName: b.bankName, ifscCode: b.ifscCode, nickname: b.nickname }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.accountNumber || !form.bankName) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      if (editId) {
        const result = await updateBeneficiary(editId, form);
        if (result.success && result.beneficiary) {
          setBeneficiaries(prev => prev.map(b => b.id === editId ? result.beneficiary! : b));
          toast.success('Beneficiary updated.');
        } else {
          toast.error(result.error || 'Update failed.');
        }
      } else {
        const result = await createBeneficiary(form);
        if (result.success && result.beneficiary) {
          setBeneficiaries(prev => [...prev, result.beneficiary!]);
          toast.success('Beneficiary added successfully.');
        } else {
          toast.error(result.error || 'Add failed.');
        }
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteBeneficiary(id);
      if (result.success) {
        setBeneficiaries(prev => prev.filter(b => b.id !== id));
        toast.success('Beneficiary removed.');
      } else {
        toast.error(result.error || 'Delete failed.');
      }
    } catch (err) {
      toast.error('Delete failed.');
    }
    setDeleteId(null);
  };

  const bankColors: Record<string, string> = {
    'NeoBank': 'bg-blue-100 text-blue-700',
    'Chase Bank': 'bg-indigo-100 text-indigo-700',
    'Bank of America': 'bg-red-100 text-red-700',
    'Wells Fargo': 'bg-yellow-100 text-yellow-700',
  };

  if (loading) {
    return (
      <AppLayout title="Beneficiaries" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Beneficiaries" subtitle="Manage your saved transfer recipients">
      <div className="space-y-5">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search beneficiaries..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Beneficiary
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: beneficiaries.length, icon: Users2, color: 'text-blue-600 bg-blue-50' },
            { label: 'NeoBank', value: beneficiaries.filter(b => b.bankName === 'NeoBank').length, icon: Building2, color: 'text-green-600 bg-green-50' },
            { label: 'External', value: beneficiaries.filter(b => b.bankName !== 'NeoBank').length, icon: CreditCard, color: 'text-orange-600 bg-orange-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Beneficiary Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
            <Users2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-foreground">No beneficiaries found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Add a beneficiary to start transferring funds quickly.</p>
            <button onClick={openAdd} className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Add First Beneficiary
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group animate-fade-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {b.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground italic">"{b.nickname}"</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono">{b.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bankColors[b.bankName] || 'bg-gray-100 text-gray-700'}`}>{b.bankName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{b.ifscCode}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  Added on {b.addedAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg">{editId ? 'Edit Beneficiary' : 'Add New Beneficiary'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { field: 'nickname', label: 'Nickname', placeholder: 'e.g. Mom, Landlord', required: false },
                { field: 'name', label: 'Full Name', placeholder: 'John Smith', required: true },
                { field: 'accountNumber', label: 'Account Number', placeholder: '1234-5678-9012-3456', required: true },
                { field: 'bankName', label: 'Bank Name', placeholder: 'e.g. NeoBank, Chase', required: true },
                { field: 'ifscCode', label: 'IFSC / Routing Code', placeholder: 'NEOB0001234', required: false },
              ].map(({ field, label, placeholder, required }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    value={form[field as keyof BeneficiaryFormData]}
                    onChange={setField(field as keyof BeneficiaryFormData)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4" /> {editId ? 'Save Changes' : 'Add Beneficiary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-heading font-bold text-base text-center mb-1">Remove Beneficiary?</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-md">Remove</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
