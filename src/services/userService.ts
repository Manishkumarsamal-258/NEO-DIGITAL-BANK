import api from './api';
import type { User } from '@/types';

export async function getProfile(): Promise<User> {
  const response = await api.get('/users/me');
  return response.data.data;
}

export async function updateProfile(data: { name?: string; phone?: string; address?: string }): Promise<User> {
  const response = await api.put('/users/me', data);
  return response.data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await api.put('/users/me/password', { currentPassword, newPassword });
    return { success: true, message: response.data.message };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.message || 'Failed to change password.' };
  }
}
