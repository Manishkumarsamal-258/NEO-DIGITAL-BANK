# NeoBank — API Documentation

**Base URL:** `http://localhost:8080/api` (development) or your deployed backend URL

**Auth:** JWT Bearer token in `Authorization` header

**Response Format:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## Authentication

### `POST /auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "alice@neobank.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": "u1",
    "name": "Alice Johnson",
    "email": "alice@neobank.com",
    "role": "customer",
    "phone": "+1 (555) 234-5678",
    "address": "123 Maple Street, New York, NY 10001",
    "createdAt": "2024-01-15",
    "status": "active",
    "avatarInitials": "AJ"
  }
}
```

### `POST /auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1 (555) 111-2222",
  "address": "456 Main St"
}
```

**Response (200):** Same format as login.

---

## Accounts

### `GET /accounts`

Get all accounts for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "acc1",
      "userId": "u1",
      "accountNumber": "4521-8736-1092-3847",
      "accountType": "savings",
      "balance": 24580.50,
      "currency": "USD",
      "status": "active",
      "createdAt": "2024-01-15",
      "interestRate": 3.5
    }
  ]
}
```

### `GET /accounts/{id}`

Get a specific account by its internal ID.

**Headers:** `Authorization: Bearer <token>`

### `GET /accounts/lookup/{accountNumber}`

Look up an account by its 16-digit account number. Returns account details and owner information.

**Example:** `GET /accounts/lookup/4521-8736-1092-3847`

**Response:**
```json
{
  "success": true,
  "data": {
    "account": { "id": "acc1", "accountNumber": "4521-8736-1092-3847", ... },
    "ownerName": "Alice Johnson",
    "ownerEmail": "alice@neobank.com"
  }
}
```

---

## Transactions

### `GET /transactions`

Get all transactions for the authenticated user (most recent first).

**Headers:** `Authorization: Bearer <token>`

### `POST /transactions/transfer`

Transfer funds to another account.

**Request Body:**
```json
{
  "fromAccountId": "acc1",
  "toAccountNumber": "1234-5678-9012-3456",
  "toBeneficiaryId": "ben1",
  "amount": 1500.00,
  "description": "Rent payment"
}
```

> Either `toAccountNumber` or `toBeneficiaryId` is required.

### `POST /transactions/deposit`

Deposit funds into your own account.

**Request Body:**
```json
{
  "accountId": "acc1",
  "amount": 500.00,
  "description": "Cash deposit"
}
```

### `POST /transactions/withdraw`

Withdraw funds from your own account.

**Request Body:**
```json
{
  "accountId": "acc1",
  "amount": 200.00,
  "description": "ATM withdrawal"
}
```

---

## Beneficiaries

### `GET /beneficiaries`

Get all beneficiaries for the authenticated user.

### `POST /beneficiaries`

Add a new beneficiary.

**Request Body:**
```json
{
  "name": "Bob Martinez",
  "accountNumber": "1234-5678-9012-3456",
  "bankName": "NeoBank",
  "ifscCode": "NEOB0001234",
  "nickname": "Bob"
}
```

### `PUT /beneficiaries/{id}`

Update a beneficiary.

### `DELETE /beneficiaries/{id}`

Delete a beneficiary.

---

## User Profile

### `GET /users/me`

Get the authenticated user's profile.

### `PUT /users/me`

Update profile details.

**Request Body:**
```json
{
  "name": "Alice J.",
  "phone": "+1 (555) 999-9999",
  "address": "Updated address"
}
```

### `PUT /users/me/password`

Change password.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePass456"
}
```

---

## KYC (Know Your Customer)

### `GET /kyc/status`

Get KYC verification status.

### `GET /kyc/my`

Get all KYC documents for the authenticated user.

### `POST /kyc/submit`

Submit a KYC document.

**Request Body:**
```json
{
  "documentType": "AADHAR",
  "documentNumber": "1234-5678-9012",
  "documentImageUrl": "https://example.com/doc.jpg"
}
```

---

## Teller Operations

### `GET /teller/customers`

List all customers (teller view).

### `GET /teller/customers/{userId}/accounts`

Get all accounts for a specific customer.

### `POST /teller/accounts`

Create a new account for a customer.

**Request Body:**
```json
{
  "userId": "u1",
  "accountType": "savings",
  "initialDeposit": 1000
}
```

### `POST /teller/transactions/deposit`

Deposit into a customer's account.

**Request Body:**
```json
{
  "userId": "u1",
  "accountId": "acc1",
  "amount": 500,
  "description": "Cash deposit"
}
```

### `POST /teller/transactions/withdraw`

Withdraw from a customer's account.

**Request Body:**
```json
{
  "userId": "u1",
  "accountId": "acc1",
  "amount": 200,
  "description": "Cash withdrawal"
}
```

### `PUT /teller/accounts/{accountId}/freeze`

Toggle account freeze status (active ↔ frozen).

---

## Admin Operations

### `GET /admin/users`

Get all users.

### `POST /admin/users`

Create a new user (with optional auto-created account).

**Request Body:**
```json
{
  "name": "New User",
  "email": "new@neobank.com",
  "password": "pass123",
  "phone": "+1 (555) 000-0000",
  "address": "123 Street",
  "role": "customer",
  "status": "active"
}
```

### `PUT /admin/users/{id}`

Update user details.

### `DELETE /admin/users/{id}`

Delete a user and associated data.

### `PUT /admin/users/{id}/toggle-status`

Toggle user active/suspended status.

### `GET /admin/accounts`

Get all accounts.

### `GET /admin/transactions`

Get all transactions.

### `GET /admin/transactions/failed`

Get all failed transactions.

### `GET /admin/kyc`

Get all KYC documents.

### `GET /admin/kyc/pending`

Get pending KYC documents.

### `GET /admin/kyc/stats`

Get KYC statistics (pending/verified/rejected counts).

### `GET /admin/kyc/user/{userId}`

Get KYC documents for a specific user.

### `POST /admin/kyc/verify/{kycId}`

Verify a KYC document.

### `POST /admin/kyc/reject/{kycId}`

Reject a KYC document with remarks.

**Request Body:**
```json
{
  "remarks": "Document is blurry. Please re-upload."
}
```

### `POST /admin/kyc/submit`

Submit KYC on behalf of a user.

### `GET /admin/beneficiaries`

Get all beneficiaries.

### `POST /admin/beneficiaries`

Create beneficiary for any user.

### `GET /admin/beneficiaries/user/{userId}`

Get beneficiaries for a specific user.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Insufficient funds.",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Your account has been suspended. Contact admin.",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Account not found.",
  "data": null
}
```
