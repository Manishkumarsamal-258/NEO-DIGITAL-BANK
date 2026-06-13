import api from './api';
import type { Account, User } from '@/types';

export interface TellerTransactionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function getCustomers(): Promise<User[]> {
  const response = await api.get('/teller/customers');
  return response.data.data;
}

export async function getCustomerAccounts(userId: string): Promise<Account[]> {
  const response = await api.get(`/teller/customers/${userId}/accounts`);
  return response.data.data;
}

export async function createAccount(data: {
  userId: string;
  accountType: 'savings' | 'checking' | 'fixed_deposit';
  initialDeposit?: number;
}): Promise<{ success: boolean; account?: Account; error?: string }> {
  try {
    const response = await api.post('/teller/accounts', data);
    const result = response.data;
    if (result.success) {
      return { success: true, account: result.data };
    }
    return { success: false, error: result.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to create account.' };
  }
}

export async function deposit(userId: string, amount: number, description?: string, accountId?: string): Promise<TellerTransactionResponse> {
  try {
    const response = await api.post('/teller/transactions/deposit', { userId, amount, description, accountId });
    return { success: true, message: response.data.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Deposit failed.' };
  }
}

export async function withdraw(userId: string, amount: number, description?: string, accountId?: string): Promise<TellerTransactionResponse> {
  try {
    const response = await api.post('/teller/transactions/withdraw', { userId, amount, description, accountId });
    return { success: true, message: response.data.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Withdrawal failed.' };
  }
}

export async function toggleFreeze(accountId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.put(`/teller/accounts/${accountId}/freeze`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to update account status.' };
  }
}
