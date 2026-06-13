import api from './api';
import type { Account } from '@/types';

export async function getAccounts(): Promise<Account[]> {
  const response = await api.get('/accounts');
  return response.data.data;
}

export async function getAccountById(id: string): Promise<Account> {
  const response = await api.get(`/accounts/${id}`);
  return response.data.data;
}
