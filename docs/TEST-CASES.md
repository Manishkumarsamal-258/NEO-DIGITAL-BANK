# NeoBank — Test Cases

## Overview

This document contains test cases covering all major features of the NeoBank application, including authentication, account management, transactions, teller operations, and administrative functions.

---

## 1. Authentication

### TC-001: Successful Login (Customer)
| Field | Value |
|-------|-------|
| **Description** | Customer logs in with valid credentials |
| **Preconditions** | User `alice@neobank.com` exists with password `password123` |
| **Steps** | 1. Navigate to `/login` → 2. Enter email: `alice@neobank.com` → 3. Enter password: `password123` → 4. Click "Sign In" |
| **Expected Result** | Redirected to `/dashboard`. Welcome toast shown. User name and accounts displayed. |
| **Status** | ✅ Pass |

### TC-002: Successful Login (Teller)
| Field | Value |
|-------|-------|
| **Description** | Teller logs in |
| **Steps** | Login with `teller@neobank.com` / `teller123` |
| **Expected Result** | Redirected to `/dashboard`. Teller-specific navigation shown. |
| **Status** | ✅ Pass |

### TC-003: Successful Login (Admin)
| Field | Value |
|-------|-------|
| **Description** | Admin logs in |
| **Steps** | Login with `admin@neobank.com` / `admin123` |
| **Expected Result** | Redirected to `/dashboard`. Admin-specific navigation shown including "Admin Console". |
| **Status** | ✅ Pass |

### TC-004: Login with Wrong Password
| Field | Value |
|-------|-------|
| **Description** | User enters incorrect password |
| **Steps** | Login with `alice@neobank.com` / `wrongpassword` |
| **Expected Result** | Error toast: "Invalid email or password." User stays on login page. |
| **Status** | ✅ Pass |

### TC-005: Login with Non-Existent Email
| Field | Value |
|-------|-------|
| **Description** | User enters unregistered email |
| **Steps** | Login with `unknown@test.com` / `password123` |
| **Expected Result** | Error toast: "Invalid email or password." |
| **Status** | ✅ Pass |

### TC-006: Login as Suspended User
| Field | Value |
|-------|-------|
| **Description** | Suspended user attempts to login |
| **Steps** | Login with `emma@neobank.com` / `password123` |
| **Expected Result** | Error toast: "Your account has been suspended. Contact admin." |
| **Status** | ✅ Pass |

### TC-007: Successful Registration
| Field | Value |
|-------|-------|
| **Description** | New user registers successfully |
| **Steps** | 1. Navigate to `/register` → 2. Fill all fields → 3. Submit form |
| **Expected Result** | Redirected to `/dashboard`. Auto-created savings account shown. Welcome toast. |
| **Status** | ✅ Pass |

### TC-008: Registration with Duplicate Email
| Field | Value |
|-------|-------|
| **Description** | Register with existing email |
| **Steps** | Register with `alice@neobank.com` |
| **Expected Result** | Error message: "Email already registered." |
| **Status** | ✅ Pass |

---

## 2. Account Management

### TC-009: View My Accounts
| Field | Value |
|-------|-------|
| **Description** | Customer views their accounts |
| **Preconditions** | Logged in as `alice@neobank.com` |
| **Steps** | Navigate to `/accounts` |
| **Expected Result** | Alice's savings account (`4521-8736-1092-3847`) and checking account (`7834-2901-5647-8312`) are displayed with balances and status. |
| **Status** | ✅ Pass |

### TC-010: View Account on Dashboard
| Field | Value |
|-------|-------|
| **Description** | Dashboard shows account summary |
| **Steps** | Navigate to `/dashboard` after login |
| **Expected Result** | Account cards show account type, number, balance, and status. |
| **Status** | ✅ Pass |

### TC-011: Account Lookup by Number
| Field | Value |
|-------|-------|
| **Description** | Look up an account by its number |
| **Steps** | 1. Go to Transfer page → 2. Select "Account Number" → 3. Enter `4521-8736-1092-3847` |
| **Expected Result** | Green validation badge shows "Alice Johnson · alice@neobank.com" |
| **Status** | ✅ Pass |

### TC-012: Account Lookup - Invalid Number
| Field | Value |
|-------|-------|
| **Description** | Look up a non-existent account number |
| **Steps** | Enter `0000-0000-0000-0000` |
| **Expected Result** | Red error message: "Account not found. Please verify the account number." |
| **Status** | ✅ Pass |

---

## 3. Transactions

### TC-013: Transfer to Beneficiary
| Field | Value |
|-------|-------|
| **Description** | Transfer money to a saved beneficiary |
| **Preconditions** | Logged in as `alice@neobank.com`. Balance > ₹500. |
| **Steps** | 1. Go to `/transfer` → 2. Select "Beneficiary" tab → 3. Choose "Bob" → 4. Enter amount: ₹500 → 5. Click "Review Transfer" → 6. Confirm |
| **Expected Result** | Success toast. Sender's balance decreases by ₹500. Transaction appears in history. |
| **Status** | ✅ Pass |

### TC-014: Transfer by Account Number
| Field | Value |
|-------|-------|
| **Description** | Transfer to an account by typing the number |
| **Steps** | 1. Select "Account Number" tab → 2. Enter `1234-5678-9012-3456` → 3. Enter ₹100 → Confirm |
| **Expected Result** | Success. Bob's account credited ₹100. Both sender and receiver see transaction. |
| **Status** | ✅ Pass |

### TC-015: Insufficient Funds
| Field | Value |
|-------|-------|
| **Description** | Transfer amount exceeds balance |
| **Steps** | Enter amount larger than available balance |
| **Expected Result** | Error: "Insufficient funds." No changes made. |
| **Status** | ✅ Pass |

### TC-016: Self-Deposit
| Field | Value |
|-------|-------|
| **Description** | Deposit money into own account |
| **Steps** | 1. Go to `/deposit` → 2. Select account → 3. Enter ₹1000 → 4. Submit |
| **Expected Result** | Success toast. Balance increases by ₹1000. Credit transaction recorded. |
| **Status** | ✅ Pass |

### TC-017: Self-Withdrawal
| Field | Value |
|-------|-------|
| **Description** | Withdraw money from own account |
| **Steps** | 1. Go to `/withdraw` → 2. Select account → 3. Enter ₹200 → 4. Submit |
| **Expected Result** | Success toast. Balance decreases by ₹200. Debit transaction recorded. |
| **Status** | ✅ Pass |

### TC-018: View Transaction History
| Field | Value |
|-------|-------|
| **Description** | View all transactions |
| **Steps** | Navigate to `/transactions` |
| **Expected Result** | All transactions listed with date, type, amount, status, and description. Most recent first. |
| **Status** | ✅ Pass |

### TC-019: Transfer with Zero Amount
| Field | Value |
|-------|-------|
| **Description** | Attempt transfer with ₹0 |
| **Steps** | Enter ₹0 as transfer amount |
| **Expected Result** | Validation error: "Minimum transfer amount required." |
| **Status** | ✅ Pass |

---

## 4. Beneficiaries

### TC-020: Add Beneficiary
| Field | Value |
|-------|-------|
| **Description** | Add a new beneficiary |
| **Steps** | 1. Go to `/beneficiaries` → 2. Click "Add Beneficiary" → 3. Fill details → 4. Save |
| **Expected Result** | Success toast. New beneficiary appears in the list. |
| **Status** | ✅ Pass |

### TC-021: Edit Beneficiary
| Field | Value |
|-------|-------|
| **Description** | Edit existing beneficiary |
| **Steps** | Click edit on a beneficiary → Change nickname → Save |
| **Expected Result** | Beneficiary nickname updated. |
| **Status** | ✅ Pass |

### TC-022: Delete Beneficiary
| Field | Value |
|-------|-------|
| **Description** | Delete a beneficiary |
| **Steps** | Click delete → Confirm |
| **Expected Result** | Beneficiary removed from list. Deletion confirmation toast. |
| **Status** | ✅ Pass |

---

## 5. Teller Operations

### TC-023: Teller Creates Account for Customer
| Field | Value |
|-------|-------|
| **Description** | Teller opens a new account |
| **Preconditions** | Logged in as `teller@neobank.com` |
| **Steps** | 1. Go to `/teller` → 2. Select customer → 3. Choose account type → 4. Enter initial deposit → 5. Create |
| **Expected Result** | Success toast showing the new 16-digit account number. Account appears in customer's list. |
| **Status** | ✅ Pass |

### TC-024: Teller Deposit
| Field | Value |
|-------|-------|
| **Description** | Teller deposits cash into customer account |
| **Steps** | 1. Select customer → 2. Enter deposit amount → 3. Submit |
| **Expected Result** | Customer's balance increases. Transaction recorded. |
| **Status** | ✅ Pass |

### TC-025: Teller Withdrawal
| Field | Value |
|-------|-------|
| **Description** | Teller processes cash withdrawal |
| **Steps** | 1. Select customer → 2. Enter withdrawal amount → 3. Submit |
| **Expected Result** | Customer's balance decreases. Transaction recorded. |
| **Status** | ✅ Pass |

### TC-026: Freeze/Unfreeze Account
| Field | Value |
|-------|-------|
| **Description** | Teller toggles account freeze |
| **Steps** | Click "Freeze" on an active account |
| **Expected Result** | Account status changes to "frozen". Click again → status changes back to "active". |
| **Status** | ✅ Pass |

---

## 6. Admin Operations

### TC-027: View All Users
| Field | Value |
|-------|-------|
| **Description** | Admin views all users |
| **Preconditions** | Logged in as `admin@neobank.com` |
| **Steps** | Navigate to `/admin` → Users tab |
| **Expected Result** | All 6 seed users displayed with name, email, role, status, and join date. |
| **Status** | ✅ Pass |

### TC-028: Create User
| Field | Value |
|-------|-------|
| **Description** | Admin creates a new user |
| **Steps** | 1. Click "Create User" → 2. Fill form → 3. Submit |
| **Expected Result** | User created with auto-generated savings account. New user can login immediately. |
| **Status** | ✅ Pass |

### TC-029: Toggle User Status
| Field | Value |
|-------|-------|
| **Description** | Admin suspends/activates a user |
| **Steps** | Click "Toggle Status" on a user |
| **Expected Result** | User status toggles between active and suspended. Suspended user cannot login. |
| **Status** | ✅ Pass |

### TC-030: View All Transactions
| Field | Value |
|-------|-------|
| **Description** | Admin views all system transactions |
| **Steps** | Navigate to `/admin` → Transactions tab |
| **Expected Result** | All transactions from all users displayed. |
| **Status** | ✅ Pass |

### TC-031: KYC Verification Flow
| Field | Value |
|-------|-------|
| **Description** | Admin verifies KYC documents |
| **Steps** | 1. Go to KYC tab → 2. View pending documents → 3. Click "Verify" or "Reject" |
| **Expected Result** | Document status updated to "verified" or "rejected". User sees updated status. |
| **Status** | ✅ Pass |

### TC-032: Delete User
| Field | Value |
|-------|-------|
| **Description** | Admin deletes a user |
| **Steps** | Click "Delete" on a non-admin user → Confirm |
| **Expected Result** | User and all associated data (accounts, transactions, beneficiaries) removed. |
| **Status** | ✅ Pass |

---

## 7. KYC

### TC-033: Submit KYC Document
| Field | Value |
|-------|-------|
| **Description** | User submits KYC document |
| **Steps** | 1. Go to `/kyc` → 2. Select document type → 3. Enter document number → 4. Submit |
| **Expected Result** | Document submitted with "pending" status. |
| **Status** | ✅ Pass |

### TC-034: View KYC Status
| Field | Value |
|-------|-------|
| **Description** | User checks KYC status |
| **Steps** | Navigate to `/kyc` |
| **Expected Result** | Shows current KYC documents and their verification status. |
| **Status** | ✅ Pass |

---

## 8. Profile & Security

### TC-035: Update Profile
| Field | Value |
|-------|-------|
| **Description** | User updates personal information |
| **Steps** | 1. Go to `/profile` → 2. Update name/phone/address → 3. Save |
| **Expected Result** | Profile updated. Changes reflected immediately in sidebar and header. |
| **Status** | ✅ Pass |

### TC-036: Change Password
| Field | Value |
|-------|-------|
| **Description** | User changes password |
| **Steps** | 1. Go to `/profile` → 2. Enter current + new password → 3. Save |
| **Expected Result** | Password changed successfully. User can login with new password. |
| **Status** | ✅ Pass |

### TC-037: Change Password - Wrong Current Password
| Field | Value |
|-------|-------|
| **Description** | User enters wrong current password |
| **Steps** | Enter incorrect current password |
| **Expected Result** | Error: "Current password is incorrect." |
| **Status** | ✅ Pass |

---

## 9. Navigation & UI

### TC-038: Role-Based Navigation
| Field | Value |
|-------|-------|
| **Description** | Verify different nav menus per role |
| **Steps** | Login as customer → teller → admin, check sidebar |
| **Expected Result** | Customer: Dashboard, Transfer, Deposit, Withdraw, etc. Teller: Dashboard, Account Center. Admin: Dashboard, Admin Console, All Transactions. |
| **Status** | ✅ Pass |

### TC-039: Logout
| Field | Value |
|-------|-------|
| **Description** | User logs out |
| **Steps** | Click "Sign Out" in sidebar |
| **Expected Result** | Redirected to `/login`. Token cleared. Cannot access protected routes. |
| **Status** | ✅ Pass |

### TC-040: Responsive Design
| Field | Value |
|-------|-------|
| **Description** | Test mobile responsiveness |
| **Steps** | Resize browser to mobile width |
| **Expected Result** | Sidebar collapses to hamburger menu. Cards stack vertically. All functionality works on mobile. |
| **Status** | ✅ Pass |

---

## 10. Real-time Sync (Demo Mode)

### TC-041: Cross-Tab Data Sync
| Field | Value |
|-------|-------|
| **Description** | Data syncs between browser tabs |
| **Preconditions** | Demo mode enabled |
| **Steps** | 1. Open two tabs → 2. Login as Alice in Tab A → 3. Perform a transfer in Tab A → 4. Switch to Tab B |
| **Expected Result** | Tab B reflects updated balance and new transaction automatically. |
| **Status** | ✅ Pass |

### TC-042: Landing Page
| Field | Value |
|-------|-------|
| **Description** | Landing page displays correctly |
| **Steps** | Navigate to `/` |
| **Expected Result** | Hero section with carousel, features, stats, testimonials, and footer displayed. CTA buttons work. |
| **Status** | ✅ Pass |
