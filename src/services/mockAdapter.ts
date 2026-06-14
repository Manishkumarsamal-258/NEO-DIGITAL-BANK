/**
 * ── NeoBank Mock Adapter ──────────────────────────────────
 * When VITE_DEMO_MODE=true, this adapter intercepts all API
 * calls and serves data from localStorage (seeded from mockData.ts).
 *
 * This allows the app to run entirely on Vercel (or any static
 * host) without needing a Spring Boot backend or MySQL database.
 *
 * Usage: Set VITE_DEMO_MODE=true in your environment variables.
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getUsers, saveUsers,
  getAccounts, saveAccounts,
  getBeneficiaries, saveBeneficiaries,
  getTransactions, saveTransactions,
  getPasswords, savePasswords,
  getCurrentUser, setCurrentUser,
  SEED_USERS, SEED_ACCOUNTS, SEED_BENEFICIARIES,
  SEED_TRANSACTIONS, SEED_PASSWORDS,
  generateId, generateRef,
} from '@/lib/mockData';
import type { User, Account, Beneficiary, KycDocument, Transaction } from '@/types';

// ── Helpers ───────────────────────────────────────────────

function ok(data: unknown, message = 'Success'): AxiosResponse {
  return {
    data: { success: true, data, message },
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config: {} as AxiosRequestConfig,
  };
}

function fail(message: string, status = 400): AxiosResponse {
  return {
    data: { success: false, data: null, message },
    status,
    statusText: 'Error',
    headers: { 'content-type': 'application/json' },
    config: {} as AxiosRequestConfig,
  };
}

function requireUser(): User {
  const user = getCurrentUser();
  if (!user) throw { response: fail('Unauthorized. Please login.', 401) };
  return user;
}

function generateToken(user: User): string {
  return `demo_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// ── KYC helpers (stored in localStorage) ──────────────────

const KYC_KEY = 'neobank_kyc_documents';

function getKycDocs(): KycDocument[] {
  const stored = localStorage.getItem(KYC_KEY);
  if (!stored) {
    const seed: KycDocument[] = [
      { id: 'kyc1', userId: 'u1', documentType: 'AADHAR', documentNumber: '1234-5678-9012', status: 'verified', submittedAt: '2024-01-20T10:00:00Z', verifiedAt: '2024-01-22T14:00:00Z', verifiedBy: 'u4' },
      { id: 'kyc2', userId: 'u2', documentType: 'PAN', documentNumber: 'ABCDE1234F', status: 'pending', submittedAt: '2024-03-01T09:00:00Z' },
    ];
    localStorage.setItem(KYC_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
}

function saveKycDocs(docs: KycDocument[]) {
  localStorage.setItem(KYC_KEY, JSON.stringify(docs));
}

function getKycStats(): { pending: number; verified: number; rejected: number } {
  const docs = getKycDocs();
  return {
    pending: docs.filter(d => d.status === 'pending').length,
    verified: docs.filter(d => d.status === 'verified').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };
}

// ── Mock Adapter ──────────────────────────────────────────

export async function mockAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
  const { url, method, data } = config;

  // ── Delay to simulate network latency ───────────────────
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

  // ── Auth ────────────────────────────────────────────────
  if (url === '/auth/login' && method === 'post' && data) {
    const { email, password } = JSON.parse(data as string) as { email: string; password: string };
    const users = getUsers();
    const passwords = getPasswords();
    const user = users.find(u => u.email === email);
    if (!user) return fail('Invalid email or password.', 401);
    if (passwords[email] !== password) return fail('Invalid email or password.', 401);
    if (user.status === 'suspended') return fail('Your account has been suspended. Contact admin.', 403);
    setCurrentUser(user);
    return ok({
      token: generateToken(user),
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      status: user.status,
      avatarInitials: user.avatarInitials,
    });
  }

  if (url === '/auth/register' && method === 'post' && data) {
    const body = JSON.parse(data as string) as { name: string; email: string; password: string; phone: string; address: string };
    const users = getUsers();
    const passwords = getPasswords();
    if (users.find(u => u.email === body.email)) return fail('Email already registered.', 409);
    const newUser: User = {
      id: generateId(),
      name: body.name,
      email: body.email,
      role: 'customer',
      phone: body.phone || '',
      address: body.address || '',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      avatarInitials: body.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    users.push(newUser);
    saveUsers(users);
    passwords[body.email] = body.password;
    savePasswords(passwords);
    setCurrentUser(newUser);
    return ok({
      token: generateToken(newUser),
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      createdAt: newUser.createdAt,
      status: newUser.status,
      avatarInitials: newUser.avatarInitials,
    });
  }

  // ── Users / Profile ─────────────────────────────────────
  if (url === '/users/me' && method === 'get') {
    const user = requireUser();
    return ok(user);
  }

  if (url === '/users/me' && method === 'put' && data) {
    const user = requireUser();
    const updates = JSON.parse(data as string) as Partial<User>;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return fail('User not found.', 404);
    users[idx] = { ...users[idx], ...updates, id: user.id };
    saveUsers(users);
    setCurrentUser(users[idx]);
    return ok(users[idx], 'Profile updated successfully.');
  }

  if (url === '/users/me/password' && method === 'put' && data) {
    const user = requireUser();
    const { currentPassword, newPassword } = JSON.parse(data as string);
    const passwords = getPasswords();
    if (passwords[user.email] !== currentPassword) return fail('Current password is incorrect.', 400);
    passwords[user.email] = newPassword;
    savePasswords(passwords);
    return ok(null, 'Password changed successfully.');
  }

  // ── Accounts ────────────────────────────────────────────
  if (url === '/accounts' && method === 'get') {
    const user = requireUser();
    const accounts = getAccounts().filter(a => a.userId === user.id);
    return ok(accounts);
  }

  const accountMatch = url?.match(/^\/accounts\/(.+)$/);
  if (accountMatch && method === 'get') {
    requireUser();
    const account = getAccounts().find(a => a.id === accountMatch[1]);
    if (!account) return fail('Account not found.', 404);
    return ok(account);
  }

  // ── Beneficiaries ───────────────────────────────────────
  if (url === '/beneficiaries' && method === 'get') {
    const user = requireUser();
    const beneficiaries = getBeneficiaries().filter(b => b.userId === user.id);
    return ok(beneficiaries);
  }

  if (url === '/beneficiaries' && method === 'post' && data) {
    const user = requireUser();
    const body = JSON.parse(data as string);
    const beneficiary: Beneficiary = {
      id: generateId(),
      userId: user.id,
      name: body.name,
      accountNumber: body.accountNumber,
      bankName: body.bankName,
      ifscCode: body.ifscCode || '',
      nickname: body.nickname || '',
      addedAt: new Date().toISOString(),
    };
    const beneficiaries = getBeneficiaries();
    beneficiaries.push(beneficiary);
    saveBeneficiaries(beneficiaries);
    return ok(beneficiary, 'Beneficiary added successfully.');
  }

  const beneficiaryUpdateMatch = url?.match(/^\/beneficiaries\/(.+)$/);
  if (beneficiaryUpdateMatch && method === 'put' && data) {
    requireUser();
    const body = JSON.parse(data as string);
    const beneficiaries = getBeneficiaries();
    const idx = beneficiaries.findIndex(b => b.id === beneficiaryUpdateMatch[1]);
    if (idx === -1) return fail('Beneficiary not found.', 404);
    beneficiaries[idx] = { ...beneficiaries[idx], ...body, id: beneficiaryUpdateMatch[1] };
    saveBeneficiaries(beneficiaries);
    return ok(beneficiaries[idx], 'Beneficiary updated successfully.');
  }

  if (beneficiaryUpdateMatch && method === 'delete') {
    requireUser();
    const beneficiaries = getBeneficiaries().filter(b => b.id !== beneficiaryUpdateMatch[1]);
    saveBeneficiaries(beneficiaries);
    return ok(null, 'Beneficiary deleted successfully.');
  }

  // ── Transactions ────────────────────────────────────────
  if (url === '/transactions' && method === 'get') {
    const user = requireUser();
    const transactions = getTransactions().filter(t => t.userId === user.id);
    return ok(transactions);
  }

  if (url === '/transactions/transfer' && method === 'post' && data) {
    const user = requireUser();
    const body = JSON.parse(data as string);
    const accounts = getAccounts();
    const fromAccount = accounts.find(a => a.id === body.fromAccountId);
    if (!fromAccount) return fail('Source account not found.', 404);
    if (fromAccount.balance < body.amount) return fail('Insufficient funds.', 400);

    // Find destination account by number or beneficiary
    let toAccount: Account | undefined;
    if (body.toAccountNumber) {
      toAccount = accounts.find(a => a.accountNumber === body.toAccountNumber);
    }
    if (body.toBeneficiaryId) {
      const ben = getBeneficiaries().find(b => b.id === body.toBeneficiaryId);
      if (ben) toAccount = accounts.find(a => a.accountNumber === ben.accountNumber);
    }
    if (!toAccount) return fail('Destination account not found.', 404);

    // Update balances
    fromAccount.balance -= body.amount;
    toAccount.balance += body.amount;
    saveAccounts(accounts);

    const transaction: Transaction = {
      id: generateId(),
      fromAccountId: body.fromAccountId,
      toAccountId: toAccount.id,
      userId: user.id,
      type: 'transfer',
      amount: body.amount,
      currency: 'INR',
      description: body.description || 'Transfer',
      status: 'completed',
      reference: generateRef(),
      createdAt: new Date().toISOString(),
      category: 'Transfer',
    };
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return ok(transaction, 'Transfer completed successfully.');
  }

  if (url === '/transactions/deposit' && method === 'post' && data) {
    const user = requireUser();
    const body = JSON.parse(data as string);
    const accounts = getAccounts();
    const account = accounts.find(a => a.id === body.accountId);
    if (!account) return fail('Account not found.', 404);
    if (account.userId !== user.id) return fail('Account does not belong to you.', 403);

    account.balance += body.amount;
    saveAccounts(accounts);

    const transaction: Transaction = {
      id: generateId(),
      fromAccountId: 'external',
      toAccountId: account.id,
      userId: user.id,
      type: 'credit',
      amount: body.amount,
      currency: 'INR',
      description: body.description || 'Deposit',
      status: 'completed',
      reference: generateRef(),
      createdAt: new Date().toISOString(),
      category: 'Deposit',
    };
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return ok(transaction, 'Deposit completed successfully.');
  }

  if (url === '/transactions/withdraw' && method === 'post' && data) {
    const user = requireUser();
    const body = JSON.parse(data as string);
    const accounts = getAccounts();
    const account = accounts.find(a => a.id === body.accountId);
    if (!account) return fail('Account not found.', 404);
    if (account.userId !== user.id) return fail('Account does not belong to you.', 403);
    if (account.balance < body.amount) return fail('Insufficient funds.', 400);

    account.balance -= body.amount;
    saveAccounts(accounts);

    const transaction: Transaction = {
      id: generateId(),
      fromAccountId: account.id,
      userId: user.id,
      type: 'debit',
      amount: body.amount,
      currency: 'INR',
      description: body.description || 'Withdrawal',
      status: 'completed',
      reference: generateRef(),
      createdAt: new Date().toISOString(),
      category: 'Withdrawal',
    };
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return ok(transaction, 'Withdrawal completed successfully.');
  }

  // ── KYC ─────────────────────────────────────────────────
  if (url === '/kyc/status' && method === 'get') {
    requireUser();
    return ok({ status: 'pending', message: 'KYC verification pending.' });
  }

  if (url === '/kyc/my' && method === 'get') {
    const user = requireUser();
    return ok(getKycDocs().filter(d => d.userId === user.id));
  }

  if (url === '/kyc/submit' && method === 'post' && data) {
    const user = requireUser();
    const body = JSON.parse(data as string);
    const doc: KycDocument = {
      id: generateId(),
      userId: user.id,
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      documentImageUrl: body.documentImageUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const docs = getKycDocs();
    docs.push(doc);
    saveKycDocs(docs);
    return ok(doc, 'KYC document submitted successfully.');
  }

  // ── Admin ───────────────────────────────────────────────
  const adminUserMatch = url?.match(/^\/admin\/users\/(.+)\/toggle-status$/);
  if (adminUserMatch && method === 'put') {
    requireUser();
    const users = getUsers();
    const idx = users.findIndex(u => u.id === adminUserMatch[1]);
    if (idx === -1) return fail('User not found.', 404);
    users[idx].status = users[idx].status === 'active' ? 'suspended' : 'active';
    saveUsers(users);
    return ok(users[idx], 'User status updated.');
  }

  if (url === '/admin/users' && method === 'get') return ok(getUsers());
  if (url === '/admin/accounts' && method === 'get') return ok(getAccounts());
  if (url === '/admin/transactions' && method === 'get') return ok(getTransactions());
  if (url === '/admin/transactions/failed' && method === 'get') {
    return ok(getTransactions().filter(t => t.status === 'failed'));
  }
  if (url === '/admin/kyc' && method === 'get') return ok(getKycDocs());
  if (url === '/admin/kyc/pending' && method === 'get') {
    return ok(getKycDocs().filter(d => d.status === 'pending'));
  }
  if (url === '/admin/kyc/stats' && method === 'get') return ok(getKycStats());

  const kycUserMatch = url?.match(/^\/admin\/kyc\/user\/(.+)$/);
  if (kycUserMatch && method === 'get') {
    return ok(getKycDocs().filter(d => d.userId === kycUserMatch[1]));
  }

  const kycVerifyMatch = url?.match(/^\/admin\/kyc\/verify\/(.+)$/);
  if (kycVerifyMatch && method === 'post') {
    const docs = getKycDocs();
    const idx = docs.findIndex(d => d.id === kycVerifyMatch[1]);
    if (idx === -1) return fail('KYC document not found.', 404);
    docs[idx].status = 'verified';
    docs[idx].verifiedAt = new Date().toISOString();
    docs[idx].verifiedBy = getCurrentUser()?.id || 'admin';
    saveKycDocs(docs);
    return ok(docs[idx], 'KYC document verified.');
  }

  const kycRejectMatch = url?.match(/^\/admin\/kyc\/reject\/(.+)$/);
  if (kycRejectMatch && method === 'post' && data) {
    const body = JSON.parse(data as string);
    const docs = getKycDocs();
    const idx = docs.findIndex(d => d.id === kycRejectMatch[1]);
    if (idx === -1) return fail('KYC document not found.', 404);
    docs[idx].status = 'rejected';
    docs[idx].remarks = body.remarks || 'Rejected';
    saveKycDocs(docs);
    return ok(docs[idx], 'KYC document rejected.');
  }

  if (url === '/admin/kyc/submit' && method === 'post' && data) {
    const body = JSON.parse(data as string);
    const doc: KycDocument = {
      id: generateId(),
      userId: body.userId,
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      documentImageUrl: body.documentImageUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const docs = getKycDocs();
    docs.push(doc);
    saveKycDocs(docs);
    return ok(doc, 'KYC document submitted by admin.');
  }

  // ── Teller ──────────────────────────────────────────────
  if (url === '/teller/customers' && method === 'get') {
    return ok(getUsers());
  }

  const tellerAccountsMatch = url?.match(/^\/teller\/customers\/(.+)\/accounts$/);
  if (tellerAccountsMatch && method === 'get') {
    return ok(getAccounts().filter(a => a.userId === tellerAccountsMatch[1]));
  }

  if (url === '/teller/accounts' && method === 'post' && data) {
    const body = JSON.parse(data as string);
    const account: Account = {
      id: generateId(),
      userId: body.userId,
      accountNumber: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      accountType: body.accountType || 'savings',
      balance: body.initialDeposit || 0,
      currency: 'INR',
      status: 'active',
      createdAt: new Date().toISOString(),
      interestRate: body.accountType === 'savings' ? 3.5 : 0.5,
    };
    const accounts = getAccounts();
    accounts.push(account);
    saveAccounts(accounts);
    return ok(account, 'Account created successfully.');
  }

  if (url === '/teller/transactions/deposit' && method === 'post' && data) {
    const body = JSON.parse(data as string);
    const accounts = getAccounts();
    const target = body.accountId
      ? accounts.find(a => a.id === body.accountId)
      : accounts.find(a => a.userId === body.userId);
    if (!target) return fail('Account not found.', 404);
    target.balance += body.amount;
    saveAccounts(accounts);
    const txn: Transaction = {
      id: generateId(), fromAccountId: 'external', toAccountId: target.id,
      userId: body.userId, type: 'credit', amount: body.amount,
      currency: 'INR', description: body.description || 'Teller deposit',
      status: 'completed', reference: generateRef(), createdAt: new Date().toISOString(), category: 'Deposit',
    };
    const txns = getTransactions();
    txns.unshift(txn);
    saveTransactions(txns);
    return ok(txn, 'Deposit successful.');
  }

  if (url === '/teller/transactions/withdraw' && method === 'post' && data) {
    const body = JSON.parse(data as string);
    const accounts = getAccounts();
    const target = body.accountId
      ? accounts.find(a => a.id === body.accountId)
      : accounts.find(a => a.userId === body.userId);
    if (!target) return fail('Account not found.', 404);
    if (target.balance < body.amount) return fail('Insufficient funds.', 400);
    target.balance -= body.amount;
    saveAccounts(accounts);
    const txn: Transaction = {
      id: generateId(), fromAccountId: target.id, userId: body.userId,
      type: 'debit', amount: body.amount, currency: 'INR',
      description: body.description || 'Teller withdrawal',
      status: 'completed', reference: generateRef(), createdAt: new Date().toISOString(), category: 'Withdrawal',
    };
    const txns = getTransactions();
    txns.unshift(txn);
    saveTransactions(txns);
    return ok(txn, 'Withdrawal successful.');
  }

  const tellerFreezeMatch = url?.match(/^\/teller\/accounts\/(.+)\/freeze$/);
  if (tellerFreezeMatch && method === 'put') {
    const accounts = getAccounts();
    const idx = accounts.findIndex(a => a.id === tellerFreezeMatch[1]);
    if (idx === -1) return fail('Account not found.', 404);
    accounts[idx].status = accounts[idx].status === 'active' ? 'frozen' : 'active';
    saveAccounts(accounts);
    return ok(accounts[idx], `Account ${accounts[idx].status === 'frozen' ? 'frozen' : 'unfrozen'} successfully.`);
  }

  // ── Fallback ────────────────────────────────────────────
  console.warn(`[MockAdapter] Unhandled request: ${method?.toUpperCase()} ${url}`);
  return fail(`Endpoint not found in mock: ${method?.toUpperCase()} ${url}`, 404);
}
