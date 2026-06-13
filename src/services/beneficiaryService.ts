import api from './api';
import type { Beneficiary } from '@/types';

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  const response = await api.get('/beneficiaries');
  return response.data.data;
}

export async function createBeneficiary(data: {
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  nickname?: string;
}): Promise<{ success: boolean; beneficiary?: Beneficiary; error?: string }> {
  try {
    const response = await api.post('/beneficiaries', data);
    const result = response.data;
    if (result.success) {
      return { success: true, beneficiary: result.data };
    }
    return { success: false, error: result.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to create beneficiary.' };
  }
}

export async function updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<{ success: boolean; beneficiary?: Beneficiary; error?: string }> {
  try {
    const response = await api.put(`/beneficiaries/${id}`, data);
    const result = response.data;
    if (result.success) {
      return { success: true, beneficiary: result.data };
    }
    return { success: false, error: result.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to update beneficiary.' };
  }
}

export async function deleteBeneficiary(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.delete(`/beneficiaries/${id}`);
    return { success: response.data.success, error: response.data.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to delete beneficiary.' };
  }
}
