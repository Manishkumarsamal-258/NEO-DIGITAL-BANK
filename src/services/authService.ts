import api from './api';
import type { User } from '@/types';

export interface LoginResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  createdAt: string;
  status: string;
  avatarInitials: string;
}

export interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export async function login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await api.post<ApiResult<LoginResponse>>('/auth/login', { email, password });
    const result = response.data;

    if (result.success && result.data) {
      localStorage.setItem('neobank_token', result.data.token);
      const user: User = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role as User['role'],
        phone: result.data.phone,
        address: result.data.address,
        createdAt: result.data.createdAt,
        status: result.data.status as User['status'],
        avatarInitials: result.data.avatarInitials,
      };
      localStorage.setItem('neobank_user', JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, error: result.message || 'Login failed.' };
  } catch (err: any) {
    const message = err.response?.data?.message || 'Network error. Unable to connect to server.';
    return { success: false, error: message };
  }
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await api.post<ApiResult<LoginResponse>>('/auth/register', data);
    const result = response.data;

    if (result.success && result.data) {
      localStorage.setItem('neobank_token', result.data.token);
      const user: User = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role as User['role'],
        phone: result.data.phone,
        address: result.data.address,
        createdAt: result.data.createdAt,
        status: result.data.status as User['status'],
        avatarInitials: result.data.avatarInitials,
      };
      localStorage.setItem('neobank_user', JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, error: result.message || 'Registration failed.' };
  } catch (err: any) {
    const message = err.response?.data?.message || 'Network error. Unable to connect to server.';
    return { success: false, error: message };
  }
}

export function logout(): void {
  localStorage.removeItem('neobank_token');
  localStorage.removeItem('neobank_user');
  localStorage.removeItem('neobank_current_user');
}

export function getAuth(): { user: User | null; isAuthenticated: boolean } {
  const userStr = localStorage.getItem('neobank_user');
  const token = localStorage.getItem('neobank_token');
  if (userStr && token) {
    try {
      const user = JSON.parse(userStr) as User;
      return { user, isAuthenticated: true };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  }
  return { user: null, isAuthenticated: false };
}

export function requireAuth(): User | null {
  const { user } = getAuth();
  return user;
}
