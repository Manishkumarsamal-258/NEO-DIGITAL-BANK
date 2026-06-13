import api from './api';
import type { Transaction } from '@/types';

export async function getTransactions(): Promise<Transaction[]> {
  const res = await api.get('/transactions');
  return res.data.data;
}

export async function transfer(data: {
  fromAccountId: string;
  toAccountNumber?: string;
  toBeneficiaryId?: string;
  amount: number;
  description?: string;
}): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  try {
    const res = await api.post('/transactions/transfer', data);
    return { success: true, transaction: res.data.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || err.message || 'Transfer failed' };
  }
}

export async function selfDeposit(data: {
  accountId: string;
  amount: number;
  description?: string;
}): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  try {
    const res = await api.post('/transactions/deposit', data);
    return { success: true, transaction: res.data.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || err.message || 'Deposit failed' };
  }
}

export async function selfWithdraw(data: {
  accountId: string;
  amount: number;
  description?: string;
}): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  try {
    const res = await api.post('/transactions/withdraw', data);
    return { success: true, transaction: res.data.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || err.message || 'Withdrawal failed' };
  }
}
