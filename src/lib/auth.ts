import type { User } from '@/types';
import * as authService from '@/services/authService';

// Re-export the API-based auth functions
export async function login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  return authService.login(email, password);
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  return authService.register(data);
}

export function logout(): void {
  authService.logout();
}

export function getAuth(): { user: User | null; isAuthenticated: boolean } {
  return authService.getAuth();
}

export function requireAuth(): User | null {
  return authService.requireAuth();
}
