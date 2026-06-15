import type { User, Account, Beneficiary, Transaction } from '@/types';

// ── Seed users ──────────────────────────────────────────────────────────────
export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@neobank.com',
    role: 'customer',
    phone: '+1 (555) 234-5678',
    address: '123 Maple Street, New York, NY 10001',
    createdAt: '2024-01-15',
    status: 'active',
    avatarInitials: 'AJ',
  },
  {
    id: 'u2',
    name: 'Bob Martinez',
    email: 'bob@neobank.com',
    role: 'customer',
    phone: '+1 (555) 345-6789',
    address: '456 Oak Avenue, Los Angeles, CA 90001',
    createdAt: '2024-02-20',
    status: 'active',
    avatarInitials: 'BM',
  },
  {
    id: 'u3',
    name: 'Sarah Chen',
    email: 'teller@neobank.com',
    role: 'teller',
    phone: '+1 (555) 456-7890',
    address: '789 Pine Road, Chicago, IL 60601',
    createdAt: '2023-11-10',
    status: 'active',
    avatarInitials: 'SC',
  },
  {
    id: 'u4',
    name: 'Michael Brown',
    email: 'admin@neobank.com',
    role: 'admin',
    phone: '+1 (555) 567-8901',
    address: '321 Elm Street, Houston, TX 77001',
    createdAt: '2023-08-05',
    status: 'active',
    avatarInitials: 'MB',
  },
  {
    id: 'u5',
    name: 'Emma Wilson',
    email: 'emma@neobank.com',
    role: 'customer',
    phone: '+1 (555) 678-9012',
    address: '654 Birch Lane, Phoenix, AZ 85001',
    createdAt: '2024-03-08',
    status: 'suspended',
    avatarInitials: 'EW',
  },
  {
    id: 'u6',
    name: 'Akash Kumar',
    email: 'akash@neobank.com',
    role: 'customer',
    phone: '+1 (555) 789-0123',
    address: '987 Cedar Drive, San Francisco, CA 94101',
    createdAt: '2024-04-15',
    status: 'active',
    avatarInitials: 'AK',
  },
];

export const SEED_PASSWORDS: Record<string, string> = {
  'alice@neobank.com': 'password123',
  'bob@neobank.com': 'password123',
  'teller@neobank.com': 'teller123',
  'admin@neobank.com': 'admin123',
  'emma@neobank.com': 'password123',
  'akash@neobank.com': 'password123',
};

// ── Seed accounts ────────────────────────────────────────────────────────────
export const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc1',
    userId: 'u1',
    accountNumber: '4521-8736-1092-3847',
    accountType: 'savings',
    balance: 24580.50,
    currency: 'USD',
    status: 'active',
    createdAt: '2024-01-15',
    interestRate: 3.5,
  },
  {
    id: 'acc2',
    userId: 'u1',
    accountNumber: '7834-2901-5647-8312',
    accountType: 'checking',
    balance: 8240.75,
    currency: 'USD',
    status: 'active',
    createdAt: '2024-01-15',
    interestRate: 0.5,
  },
  {
    id: 'acc3',
    userId: 'u2',
    accountNumber: '1234-5678-9012-3456',
    accountType: 'savings',
    balance: 15320.00,
    currency: 'USD',
    status: 'active',
    createdAt: '2024-02-20',
    interestRate: 3.5,
  },
  {
    id: 'acc4',
    userId: 'u5',
    accountNumber: '9876-5432-1098-7654',
    accountType: 'checking',
    balance: 1200.00,
    currency: 'USD',
    status: 'frozen',
    createdAt: '2024-03-08',
    interestRate: 0.5,
  },
  {
    id: 'acc5',
    userId: 'u6',
    accountNumber: '9368-4350-2662-4153',
    accountType: 'savings',
    balance: 5000.00,
    currency: 'INR',
    status: 'active',
    createdAt: '2024-04-15',
    interestRate: 3.5,
  },
];

// ── Seed beneficiaries ────────────────────────────────────────────────────────
export const SEED_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben1',
    userId: 'u1',
    name: 'Bob Martinez',
    accountNumber: '1234-5678-9012-3456',
    bankName: 'NeoBank',
    ifscCode: 'NEOB0001234',
    nickname: 'Bob',
    addedAt: '2024-02-01',
  },
  {
    id: 'ben2',
    userId: 'u1',
    name: 'Emma Wilson',
    accountNumber: '9876-5432-1098-7654',
    bankName: 'NeoBank',
    ifscCode: 'NEOB0005678',
    nickname: 'Emma',
    addedAt: '2024-02-15',
  },
  {
    id: 'ben3',
    userId: 'u1',
    name: 'Chase Bank Rent',
    accountNumber: '4567-8901-2345-6789',
    bankName: 'Chase Bank',
    ifscCode: 'CHAS0009876',
    nickname: 'Landlord',
    addedAt: '2024-03-01',
  },
  {
    id: 'ben4',
    userId: 'u2',
    name: 'Alice Johnson',
    accountNumber: '4521-8736-1092-3847',
    bankName: 'NeoBank',
    ifscCode: 'NEOB0001111',
    nickname: 'Alice',
    addedAt: '2024-03-05',
  },
];

// ── Seed transactions ────────────────────────────────────────────────────────
export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    fromAccountId: 'acc1',
    toAccountId: 'acc3',
    userId: 'u1',
    type: 'transfer',
    amount: 1500.00,
    currency: 'USD',
    description: 'Rent payment - June',
    status: 'completed',
    reference: 'TXN20240601001',
    createdAt: '2024-06-01T10:30:00Z',
    beneficiaryName: 'Bob Martinez',
    category: 'Housing',
  },
  {
    id: 'tx2',
    fromAccountId: 'acc1',
    userId: 'u1',
    type: 'debit',
    amount: 245.80,
    currency: 'USD',
    description: 'Grocery Store - Whole Foods',
    status: 'completed',
    reference: 'TXN20240602001',
    createdAt: '2024-06-02T14:20:00Z',
    category: 'Groceries',
  },
  {
    id: 'tx3',
    fromAccountId: 'external',
    toAccountId: 'acc1',
    userId: 'u1',
    type: 'credit',
    amount: 5000.00,
    currency: 'USD',
    description: 'Salary deposit - May 2024',
    status: 'completed',
    reference: 'TXN20240605001',
    createdAt: '2024-06-05T09:00:00Z',
    category: 'Income',
  },
  {
    id: 'tx4',
    fromAccountId: 'acc1',
    toAccountId: 'acc3',
    userId: 'u1',
    type: 'transfer',
    amount: 800.00,
    currency: 'USD',
    description: 'Loan repayment',
    status: 'failed',
    reference: 'TXN20240607001',
    createdAt: '2024-06-07T16:45:00Z',
    beneficiaryName: 'Bob Martinez',
    category: 'Finance',
  },
  {
    id: 'tx5',
    fromAccountId: 'acc1',
    userId: 'u1',
    type: 'debit',
    amount: 89.99,
    currency: 'USD',
    description: 'Netflix subscription',
    status: 'completed',
    reference: 'TXN20240608001',
    createdAt: '2024-06-08T00:00:00Z',
    category: 'Entertainment',
  },
  {
    id: 'tx6',
    fromAccountId: 'acc1',
    toAccountId: 'acc4',
    userId: 'u1',
    type: 'transfer',
    amount: 200.00,
    currency: 'USD',
    description: 'Gift for Emma',
    status: 'processing',
    reference: 'TXN20240610001',
    createdAt: '2024-06-10T11:15:00Z',
    beneficiaryName: 'Emma Wilson',
    category: 'Personal',
  },
  {
    id: 'tx7',
    fromAccountId: 'acc3',
    toAccountId: 'acc1',
    userId: 'u2',
    type: 'transfer',
    amount: 500.00,
    currency: 'USD',
    description: 'Shared expense reimbursement',
    status: 'completed',
    reference: 'TXN20240609001',
    createdAt: '2024-06-09T13:30:00Z',
    beneficiaryName: 'Alice Johnson',
    category: 'Personal',
  },
  {
    id: 'tx8',
    fromAccountId: 'acc3',
    userId: 'u2',
    type: 'debit',
    amount: 3200.00,
    currency: 'USD',
    description: 'Laptop purchase - Best Buy',
    status: 'completed',
    reference: 'TXN20240611001',
    createdAt: '2024-06-11T15:00:00Z',
    category: 'Electronics',
  },
  {
    id: 'tx9',
    fromAccountId: 'acc3',
    toAccountId: 'acc1',
    userId: 'u2',
    type: 'transfer',
    amount: 1200.00,
    currency: 'USD',
    description: 'Business payment',
    status: 'failed',
    reference: 'TXN20240611002',
    createdAt: '2024-06-11T17:30:00Z',
    beneficiaryName: 'Alice Johnson',
    category: 'Business',
  },
  {
    id: 'tx10',
    fromAccountId: 'external',
    toAccountId: 'acc1',
    userId: 'u1',
    type: 'credit',
    amount: 350.00,
    currency: 'USD',
    description: 'Freelance payment',
    status: 'completed',
    reference: 'TXN20240612001',
    createdAt: '2024-06-12T08:45:00Z',
    category: 'Income',
  },
];

// ── Storage helpers ──────────────────────────────────────────────────────────
const KEYS = {
  users: 'neobank_users',
  accounts: 'neobank_accounts',
  beneficiaries: 'neobank_beneficiaries',
  transactions: 'neobank_transactions',
  currentUser: 'neobank_current_user',
  passwords: 'neobank_passwords',
};

function init<T>(key: string, seed: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored) as T;
}

export function getUsers(): User[] { return init(KEYS.users, SEED_USERS); }
export function getAccounts(): Account[] { return init(KEYS.accounts, SEED_ACCOUNTS); }
export function getBeneficiaries(): Beneficiary[] { return init(KEYS.beneficiaries, SEED_BENEFICIARIES); }
export function getTransactions(): Transaction[] { return init(KEYS.transactions, SEED_TRANSACTIONS); }
export function getPasswords(): Record<string, string> { return init(KEYS.passwords, SEED_PASSWORDS); }

export function saveUsers(users: User[]) { localStorage.setItem(KEYS.users, JSON.stringify(users)); }
export function saveAccounts(accounts: Account[]) { localStorage.setItem(KEYS.accounts, JSON.stringify(accounts)); }
export function saveBeneficiaries(b: Beneficiary[]) { localStorage.setItem(KEYS.beneficiaries, JSON.stringify(b)); }
export function saveTransactions(t: Transaction[]) { localStorage.setItem(KEYS.transactions, JSON.stringify(t)); }
export function savePasswords(p: Record<string, string>) { localStorage.setItem(KEYS.passwords, JSON.stringify(p)); }

export function getCurrentUser(): User | null {
  const s = localStorage.getItem(KEYS.currentUser);
  return s ? JSON.parse(s) : null;
}
export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  else localStorage.removeItem(KEYS.currentUser);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateRef(): string {
  return 'TXN' + Date.now().toString();
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
