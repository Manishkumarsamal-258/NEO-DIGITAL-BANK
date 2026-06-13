import api from './api';
import type { Account, KycDocument, Transaction, User } from '@/types';

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
