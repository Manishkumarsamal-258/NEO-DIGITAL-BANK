# NeoBank — Entity Relationship Diagram (ERD)

## Database Overview

NeoBank uses **MySQL** as its primary database with the following entities: `users`, `accounts`, `transactions`, `beneficiaries`, and `kyc_documents`.

---

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ accounts : "has"
    users ||--o{ transactions : "initiates"
    users ||--o{ beneficiaries : "manages"
    users ||--o{ kyc_documents : "submits"
    accounts ||--o{ transactions : "involved in"

    users {
        string id PK "UUID"
        string name "Full name"
        string email UK "Email address"
        string password "BCrypt hashed"
        enum role "customer | teller | admin"
        string phone "Contact number"
        string address "Postal address"
        date created_at "Account creation date"
        enum status "active | suspended | pending"
        string avatar_initials "2-letter initials"
    }

    accounts {
        string id PK "UUID"
        string user_id FK "Owner reference"
        string account_number UK "16-digit formatted"
        enum account_type "savings | checking | fixed_deposit"
        double balance "Current balance"
        string currency "INR | USD"
        enum status "active | frozen | closed"
        date created_at "Account open date"
        double interest_rate "Annual interest rate"
    }

    transactions {
        string id PK "UUID"
        string from_account_id FK "Source account"
        string to_account_id FK "Destination account"
        string user_id FK "User who initiated"
        enum type "credit | debit | transfer"
        double amount "Transaction amount"
        string currency "INR | USD"
        text description "Narrative"
        enum status "completed | pending | failed | processing"
        string reference UK "Unique transaction reference"
        datetime created_at "Timestamp"
        string beneficiary_name "Display name"
        string category "Transaction category"
    }

    beneficiaries {
        string id PK "UUID"
        string user_id FK "Owner reference"
        string name "Beneficiary name"
        string account_number "Target account"
        string bank_name "Bank name"
        string ifsc_code "IFSC code"
        string nickname "Short name"
        date added_at "When added"
    }

    kyc_documents {
        string id PK "UUID"
        string user_id FK "User reference"
        enum document_type "AADHAR | PAN | VOTER_ID | DRIVING_LICENSE | PASSPORT"
        string document_number "Document ID"
        string document_image_url "Uploaded file URL"
        enum status "pending | verified | rejected"
        datetime submitted_at "Submission timestamp"
        datetime verified_at "Verification timestamp"
        string verified_by "Admin user ID"
        string remarks "Rejection reason"
    }
```

---

## Table Descriptions

### `users`
Stores all user accounts (customers, tellers, and admins). Passwords are hashed using BCrypt. Each user has a role that determines their permissions in the application.

### `accounts`
Bank accounts linked to users. Supports three account types with different interest rates. Account numbers follow a 16-digit format (e.g., `4521-8736-1092-3847`). Balances are updated atomically during transactions.

### `transactions`
Records every financial event. Each transaction tracks the source account, destination account, and the user who initiated it. For transfers, two records are created (one debit/transfer for sender, one credit for receiver). Statuses include `completed`, `pending`, `failed`, and `processing`.

### `beneficiaries`
Saved payees for quick transfers. Linked to a user and stores the target account details. Supports IFSC codes and nicknames for easy identification.

### `kyc_documents`
Know Your Customer documents submitted by users. Supports multiple document types (Aadhar, PAN, Voter ID, Driving License, Passport). Documents go through a verification workflow (pending → verified/rejected).

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `users` | `idx_users_email` | `email` | Fast login lookup |
| `accounts` | `idx_accounts_user` | `user_id` | Fetch user's accounts |
| `accounts` | `idx_accounts_number` | `account_number` | Account number lookup |
| `transactions` | `idx_txns_user` | `user_id` | Fetch user's transactions |
| `transactions` | `idx_txns_reference` | `reference` | Unique reference lookup |
| `beneficiaries` | `idx_beneficiaries_user` | `user_id` | Fetch user's beneficiaries |
| `kyc_documents` | `idx_kyc_user` | `user_id` | Fetch user's KYC docs |
