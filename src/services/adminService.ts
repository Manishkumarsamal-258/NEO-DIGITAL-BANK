import api, { publicApi } from './api';
import type { Account, Beneficiary, KycDocument, Transaction, User } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  const response = await api.get('/admin/users');
  return response.data.data;
}

export async function getAllAccounts(): Promise<Account[]> {
  const response = await api.get('/admin/accounts');
  return response.data.data;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const response = await api.get('/admin/transactions');
  return response.data.data;
}

export async function getFailedTransactions(): Promise<Transaction[]> {
  const response = await api.get('/admin/transactions/failed');
  return response.data.data;
}

export async function toggleUserStatus(userId: string): Promise<User> {
  const response = await api.put(`/admin/users/${userId}/toggle-status`);
  return response.data.data;
}

// ── Admin CRUD: Users ──────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string;
  status: string;
}): Promise<User> {
  const response = await api.post('/admin/users', data);
  return response.data.data;
}

export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
  status?: string;
}): Promise<User> {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

// ── KYC API ──────────────────────────────────────────────────────────────────

export async function getAllKyc(): Promise<KycDocument[]> {
  const response = await api.get('/admin/kyc');
  return response.data.data;
}

export async function getPendingKyc(): Promise<KycDocument[]> {
  const response = await api.get('/admin/kyc/pending');
  return response.data.data;
}

export async function getKycByUser(userId: string): Promise<KycDocument[]> {
  const response = await api.get(`/admin/kyc/user/${userId}`);
  return response.data.data;
}

export async function getKycStats(): Promise<{ pending: number; verified: number; rejected: number }> {
  const response = await api.get('/admin/kyc/stats');
  return response.data.data;
}

export async function verifyKyc(kycId: string): Promise<KycDocument> {
  const response = await api.post(`/admin/kyc/verify/${kycId}`);
  return response.data.data;
}

export async function rejectKyc(kycId: string, remarks: string): Promise<KycDocument> {
  const response = await api.post(`/admin/kyc/reject/${kycId}`, { remarks });
  return response.data.data;
}

export async function submitKyc(userId: string, documentType: string, documentNumber: string, documentImageUrl?: string): Promise<KycDocument> {
  const response = await api.post('/admin/kyc/submit', { userId, documentType, documentNumber, documentImageUrl });
  return response.data.data;
}

// ── Account Lookup ───────────────────────────────────────────────────────────
// Uses publicApi (no auth redirect interceptor) so 403/404 errors never redirect to login.

export async function lookupAccountByNumber(accountNumber: string): Promise<{
  account: Account;
  ownerName: string;
  ownerEmail: string;
} | null> {
  try {
    const response = await publicApi.get(`/accounts/lookup/${encodeURIComponent(accountNumber)}`);
    return response.data.data;
  } catch (_err) {
    // Any error (404 not found, 403 forbidden, network error) → gracefully return null
    return null;
  }
}

// ── Admin Beneficiary Management ─────────────────────────────────────────────

export async function getAllBeneficiaries(): Promise<Beneficiary[]> {
  const response = await api.get('/admin/beneficiaries');
  return response.data.data;
}

export async function getBeneficiariesByUser(userId: string): Promise<Beneficiary[]> {
  const response = await api.get(`/admin/beneficiaries/user/${userId}`);
  return response.data.data;
}

export async function adminCreateBeneficiary(data: {
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  nickname?: string;
}): Promise<Beneficiary> {
  const response = await api.post('/admin/beneficiaries', data);
  return response.data.data;
}
