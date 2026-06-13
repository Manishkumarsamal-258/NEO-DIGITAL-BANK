export type UserRole = 'customer' | 'teller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
  avatarInitials: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'fixed_deposit';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  interestRate: number;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  nickname: string;
  addedAt: string;
}

export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'AADHAR' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'PASSPORT';
  documentNumber: string;
  documentImageUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
}

export type TransactionType = 'credit' | 'debit' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing';

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  beneficiaryName?: string;
  category: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface TransferForm {
  fromAccountId: string;
  toBeneficiaryId?: string;
  toAccountNumber?: string;
  amount: number;
  description: string;
  transferType: 'beneficiary' | 'account';
}
