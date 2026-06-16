# NeoBank — AI ChatBot (NEO) Documentation

> **NEO — Your AI Banking Assistant**  
> A powerful, data-driven conversational AI that provides real-time answers using actual user account data.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Architecture](#-architecture)
3. [Core Files](#-core-files)
4. [How NEO Works](#-how-neo-works)
5. [Data-Driven Response System](#-data-driven-response-system)
6. [18 Query Patterns](#-18-query-patterns)
7. [Fallback Knowledge Base](#-fallback-knowledge-base)
8. [Gemini AI Integration](#-gemini-ai-integration)
9. [Chat UI Component](#-chat-ui-component)
10. [Conversation History Management](#-conversation-history-management)
11. [Smart Suggestions](#-smart-suggestions)
12. [Real-Time Data Snapshot](#-real-time-data-snapshot)
13. [Error Handling & Fallbacks](#-error-handling--fallbacks)
14. [Complete End-to-End Flow](#-complete-end-to-end-flow)
15. [Extending NEO](#-extending-neo)

---

## 🔭 Overview

**NEO** is an intelligent AI banking assistant integrated directly into the NeoBank application. It provides **instant, data-driven answers** based on the user's actual account information — balances, transactions, beneficiaries, and more.

### Key Features

| Feature | Description |
|---------|-------------|
| **Data-Driven Responses** | Answers use REAL account data, not generic instructions |
| **Google Gemini AI** | Optional free-tier integration for smarter responses |
| **18 Built-In Query Patterns** | Comprehensive NLP-style matching without any API key |
| **100% Offline Mode** | Works fully with built-in patterns — no API needed |
| **Real-Time Data** | Fetches fresh data on every message via the same APIs as the UI |
| **Comprehensive Knowledge Base** | Answers ANY banking question even with no accounts |
| **Smart Suggestions** | Context-aware follow-up questions based on conversation |
| **Floating Chat UI** | Beautiful animated chat bubble with Framer Motion |
| **Conversation History** | Persists across sessions via localStorage |
| **Animated Robot Logo** | Custom NeoBotLogo component with glowing animations |

### How It's Different

Unlike typical chatbots that give generic answers, NEO:
- **Reads your actual data** — "What's my balance?" returns **your** balance
- **Computes totals** — Sums across all accounts, filters by type
- **Analyzes trends** — Compares this month vs last month
- **Spends by category** — Shows where your money actually goes
- **Works without AI** — The built-in patterns cover every banking question

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       AiChatBot Component                       
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ Floating Button  │  │  Chat Panel     │  │  API Setup   │  │
│  │ (MessageCircle)  │  │  (380px × 580px)│  │  Dialog       │  │
│  └──────────────────┘  └────────┬────────┘  └───────────────┘  │
│                                 │                               │
└──────────────────────────────────┼──────────────────────────────
┌──────────────────────────────────────────────────────────────────┐
│                     aiService (Service Layer)                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              sendMessage(userMessage, history)               ││
│  │                                                              ││
│  │  1. buildDataSnapshot() ← fetches accounts + txns + benefs  ││
│  │  2. If Gemini key exists → try Gemini with data             ││
│  │  3. If no key / Gemini fails → buildDataResponse()          ││
│  │  4. If no user → return generic help responses              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────┐  ┌──────────────────────────────┐      │
│  │  buildDataResponse  │  │  buildDataSnapshot()          │      │
│  │  (18 patterns +     │  │  (Fetches via accountService, │      │
│  │   fallback KB)      │  │   transactionService,         │      │
│  └─────────────────────┘  │   beneficiaryService)         │      │
│                           └──────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Data Sources (via API)                         │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ accountService │  │ transactionSvc │  │ beneficiarySvc   │   │
│  │ .getAccounts() │  │ .getTxns()     │  │ .getBeneficiaries│   │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘   │
│          │                   │                    │              │
│          ▼                   ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       Mock Adapter                        │   │
│  │                 (or real Spring Boot API)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Core Files

| File | Purpose |
|------|---------|
| `src/services/aiService.ts` | Core AI service — all logic, patterns, and Gemini integration |
| `src/components/features/AiChatBot.tsx` | Floating chat UI component |
| `src/components/features/NeoBotLogo.tsx` | Animated robot logo component |
| `src/services/authService.ts` | User authentication (used for data snapshot) |
| `src/services/accountService.ts` | Account data fetching |
| `src/services/transactionService.ts` | Transaction data fetching |
| `src/services/beneficiaryService.ts` | Beneficiary data fetching |

---

## 🤖 How NEO Works

### The Three Execution Paths

```
sendMessage(userMessage, history)
        │
        ├──▶ buildDataSnapshot() ──▶ Fetches user's accounts,
        │        (async)                transactions, beneficiaries
        │                              via the same API as UI pages
        │
        ├──▶ PATH 1: Gemini AI
        │     (if API key configured)
        │     ├──▶ Build system prompt with real data
        │     ├──▶ Send to Gemini 2.0 Flash
        │     └──▶ Return AI-generated response
        │
        ├──▶ PATH 2: Data-Driven Patterns
        │     (if user IS logged in)
        │     ├──▶ Match against 18 query patterns
        │     ├──▶ Build response from actual data
        │     └──▶ Return computed response
        │
        └──▶ PATH 3: Generic Help
              (if user is NOT logged in)
              ├──▶ Match common questions
              └──▶ Return helpful guides + login prompt
```

### Path 1: Gemini AI (Optional)

When the user configures a **free Google Gemini API key**:

1. A system prompt is built containing the user's **entire financial data** as JSON
2. The conversation history is appended
3. The user's question is sent to Gemini 2.0 Flash
4. Gemini analyzes the real data and responds intelligently
5. If Gemini fails (invalid key, network error), it **falls through** to Path 2

```typescript
// The system prompt contains full financial data:
system prompt = `
You are "NEO", an AI banking assistant for NeoBank.
You have been given the user's REAL financial data below.
Respond ONLY based on this data — never make up numbers.

USER'S REAL-TIME FINANCIAL DATA
\`\`\`json
{
  "user": { "name": "Alice Johnson", ... },
  "accounts": [
    { "type": "savings", "balance": 24580.50, ... },
    { "type": "checking", "balance": 8240.75, ... }
  ],
  "transactions": [ ... ],
  "beneficiaries": [ ... ],
  "summary": { "totalBalance": 32821.25, ... }
}
\`\`\`
`
```

### Path 2: Data-Driven Patterns (Default — No API Needed)

The **primary path** — works completely offline with no API key:

1. `buildDataSnapshot()` fetches fresh data from the same APIs the UI uses
2. `buildDataResponse()` matches the query against **18 patterns**
3. Each pattern computes the answer from **actual data**
4. Returns a formatted response with markdown and emojis

### Path 3: Generic Help (Not Logged In)

When no user is detected:

1. Matches common banking questions (balance, transfer, KYC, etc.)
2. Returns informative guides with a **login prompt**
3. Encourages the user to log in for personalized answers

---

## 💡 Data-Driven Response System

### How `buildDataSnapshot()` Works

This function fetches **fresh data on every message**:

```typescript
async function buildDataSnapshot(): Promise<DataSnapshot | null> {
  // 1. Get authenticated user
  const { user } = getAuth();
  if (!user) return null;

  // 2. Fetch accounts, transactions, beneficiaries IN PARALLEL
  //    Uses the SAME API as My Accounts, Transactions, etc.
  const [accounts, transactions, beneficiaries] = await Promise.all([
    getAccountsApi()      // → mockAdapter → localStorage
      .then(accounts => accounts.map(a => ({
        type: a.accountType,
        number: a.accountNumber,
        balance: a.balance,
        currency: a.currency,
        status: a.status,
        interestRate: a.interestRate,
      })))
      .catch(() => []),

    getTransactionsApi()  // → mockAdapter → localStorage
      .then(txns => txns.sort(/* newest first */)
        .slice(0, 25)
        .map(t => ({
          type: t.type,
          amount: t.amount,
          currency: t.currency || 'INR',
          status: t.status,
          description: t.description,
          date: t.createdAt,
          category: t.category || 'Uncategorized',
        })))
      .catch(() => []),

    getBeneficiariesApi() // → mockAdapter → localStorage
      .then(benefs => benefs.map(b => ({
        name: b.name,
        nickname: b.nickname || b.name,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
      })))
      .catch(() => []),
  ]);

  // 3. Compute summary
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // 4. Return structured snapshot
  return {
    user: { name, email, role, status, memberSince, phone },
    accounts,
    transactions,
    beneficiaries,
    summary: { totalBalance, totalAccounts, activeAccounts, totalTransactions },
  };
}
```

**Key design decisions:**
- ✅ **Async** — Uses `Promise.all()` for parallel fetching (~350ms vs ~1s sequential)
- ✅ **Same API as UI** — Uses `accountService.getAccounts()` just like My Accounts page
- ✅ **Graceful degradation** — Each API call has `.catch()` returning empty array
- ✅ **No data leaks** — Only fetches authenticated user's data

### DataSnapshot Interface

```typescript
interface DataSnapshot {
  user: {
    name: string;
    email: string;
    role: string;
    status: string;
    memberSince: string;
    phone: string;
  };
  accounts: Array<{
    type: string;         // 'savings' | 'checking' | 'fixed_deposit'
    number: string;       // Masked account number
    balance: number;
    currency: string;
    status: string;       // 'active' | 'frozen' | 'closed'
    interestRate: number;
  }>;
  transactions: Array<{
    type: string;         // 'credit' | 'debit' | 'transfer'
    amount: number;
    currency: string;
    status: string;       // 'completed' | 'pending' | 'failed'
    description: string;
    date: string;
    category: string;
  }>;
  beneficiaries: Array<{
    name: string;
    nickname: string;
    bankName: string;
    accountNumber: string;
  }>;
  summary: {
    totalBalance: number;
    totalAccounts: number;
    activeAccounts: number;
    totalTransactions: number;
  };
}
```

---

## 📝 18 Query Patterns

NEO's `buildDataResponse()` function matches queries against **18 pattern groups** in order. Each pattern is designed to catch specific types of banking questions.

### Pattern Order & Priority

```
Priority 1  →  Greetings              (hi, hello, hey)
Priority 2  →  Total Balance          (balance, total, net worth)
Priority 3  →  Specific Account Type  (savings, checking)
Priority 4  →  Recent Transactions    (transactions, history, recent)
Priority 5  →  Spending by Category   (spend, expenses, category)
Priority 6  →  Income vs Expenses     (income, vs, compare)
Priority 7  →  Beneficiaries          (beneficiary, payee)
Priority 8  →  Account Numbers        (account number, my accounts)
Priority 9  →  Interest Rates         (interest, rate, APY)
Priority 10 →  Last Transaction       (last transaction, most recent)
Priority 11 →  Specific Category      (food, rent, shopping, etc.)
Priority 12 →  Account Status         (status, active, frozen)
Priority 13 →  Profile / Member Since (profile, member, joined)
Priority 14 →  Pending / Failed Txns  (pending, failed, issues)
Priority 15 →  Monthly Comparison     (this month, last month, weekly)
Priority 16 →  How-To Guides          (how do I, how to, help me)
Priority 17 →  Thank You              (thank, thanks)
Priority 18 →  Goodbye                (bye, goodbye, see you)
Fallback    →  Knowledge Base         (loans, cards, security, etc.)
```

### Pattern 1: Greetings

**Triggers:** `hi`, `hello`, `hey`, `good morning/afternoon/evening`

```typescript
/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening|day))/i.test(msg)
```

**Response includes:**
- Personalized greeting with user's name
- Financial snapshot (total balance, accounts, transactions, beneficiaries)
- Pending items alert
- Call-to-action

**Example output:**
```
👋 Hello Alice Johnson! Great to see you.

Here's your financial snapshot:

💰 Total Balance: ₹32,821.25
🏦 Accounts: 2 active of 2
📊 Recent Activity: 15 transactions
👥 Beneficiaries: 3 saved

What would you like to know?
```

### Pattern 2: Total Balance

**Triggers:** `balance`, `total`, `how much money`, `net worth`, `all my money`, `what do i have`

**Response includes:**
- Per-account breakdown with masked numbers
- Account type labels (Savings, Checking)
- Total balance across all accounts
- Insight summary (savings vs checking split)
- Active account count

**No-accounts handling:** Shows user name + account opening guide

**Example output:**
```
## 💰 Here's Your Complete Balance Breakdown

**Savings** (••••3847): ₹24,580.50
**Checking** (••••5678): ₹8,240.75

**Total:** ₹32,821.25

### Summary
💼 **Savings:** ₹24,580.50 across 1 account
💳 **Checking:** ₹8,240.75 across 1 account

📌 2 of 2 accounts are active.
```

### Pattern 3: Specific Account Type

**Triggers:** `savings` or `checking` keywords

**Response includes:**
- Filtered accounts by type
- Per-account: number, balance, status, interest rate
- Total for that account type

**No-accounts handling:** "You don't have any savings accounts yet."

### Pattern 4: Recent Transactions

**Triggers:** `transaction`, `history`, `recent`, `activity`, `last`, `latest`

**Response includes:**
- Total income and spending amounts
- Pending transaction count
- Latest 5 transactions with amounts, dates, and status
- Visual indicators (⬆️ for credit, ⬇️ for debit)

**No-data handling:** Shows guidance based on whether accounts exist

### Pattern 5: Spending by Category

**Triggers:** `spend`, `expense`, `category`, `categor`, `where`, `budget`, `going`

**Response includes:**
- Total spent
- Top spending category with percentage
- Per-category breakdown with percentages
- Visual bar chart inspiration

**No-data handling:** Explains what analytics will show once they start transacting

### Pattern 6: Income vs Expenses

**Triggers:** `income`, `earning`, `salary`, `vs`, `compare`, `profit`, `inflow`, `outflow`

**Response includes:**
- Total income (from credit transactions)
- Total expenses (from debit/transfer transactions)
- Net flow (positive or negative)
- Encouragement or warning based on net position

**Example output:**
```
## 💵 Income vs Expenses

**Income:** ₹85,000.00 (3 transactions)
**Expenses:** ₹52,178.75 (8 transactions)
**Net Flow:** ✅ +₹32,821.25

You're in a positive position! Income exceeds expenses by ₹32,821.25.
```

### Pattern 7: Beneficiaries

**Triggers:** `beneficiary`, `payee`, `recipient`, `saved`

**Response includes:**
- Number of saved beneficiaries
- List of beneficiaries with bank name and masked account
- Quick transfer reminder

**No-data handling:** "You don't have any beneficiaries saved yet."

### Pattern 8: Account Numbers

**Triggers:** `account number`, `my account`, `account detail`, `acc no`, `what accounts`, `which account`

**Response includes:**
- Per-account: type, number, balance, status
- Active account summary

**No-accounts handling:** Step-by-step account opening guide

### Pattern 9: Interest Rates

**Triggers:** `interest`, `rate`, `return`, `apy`, `apr`

**Response includes:**
- Current interest rates on actual accounts
- Calculated yearly interest on balance
- Standard rates if no accounts exist

**No-accounts handling:** Shows standard NeoBank rates

### Pattern 10: Last Transaction

**Triggers:** `last transaction`, `most recent`, `latest transaction`

**Response includes:**
- Description, amount, type, status, date, category
- Rich formatting with all details

### Pattern 11: Specific Category Spending

**Triggers (dynamic):** Food/Groceries, Rent, Entertainment, Transport, Shopping, Bills, Healthcare, Education, Travel, Income/Salary

Uses a regex map to detect category-specific queries:

```typescript
const categoryMap = {
  'food|grocery|eat|restaurant|dining': ['Groceries', 'Food & Dining'],
  'rent|housing|home|mortgage': ['Housing', 'Rent'],
  'entertain|netflix|movie|game': ['Entertainment'],
  'transport|gas|fuel|uber|lyft': ['Transportation', 'Fuel'],
  // ... 10 categories total
};
```

### Pattern 12: Account Status

**Triggers:** `status`, `active`, `frozen`, `closed`

**Response includes:**
- Count of active, frozen, and closed accounts
- Active accounts with balances

### Pattern 13: Profile / Member Since

**Triggers:** `profile`, `member`, `joined`, `since`, `info about me`

**Response includes:**
- Full profile: name, email, phone, role, status
- Member since date with days count

**Example output:**
```
## 👤 Your Profile

**Name:** Alice Johnson
**Email:** alice@neobank.com
**Phone:** +1 (555) 234-5678
**Role:** Customer
**Status:** active
**Member Since:** January 15, 2024 (520 days ago)
```

### Pattern 14: Pending / Failed Transactions

**Triggers:** `pending`, `failed`, `issue`, `problem`

**Response includes:**
- Groups pending and failed transactions
- Shows amounts, descriptions, dates
- Support contact suggestion

### Pattern 15: Monthly Comparison

**Triggers:** `month`, `this month`, `last month`, `weekly`, `period`

**Response includes:**
- This month vs last month comparison
- Income, expenses, net for each period
- This month's transactions list

### Pattern 16: How-To Guides

**Triggers:** `how do i`, `how to`, `help me`, `guide`
**NOTE:** `what is` and `can i` are intentionally excluded to prevent them from catching data queries.

**Sub-patterns:**
- Transfer/send/pay → Step-by-step transfer guide
- Deposit/add money → Deposit guide
- Withdraw/cash → Withdrawal guide
- KYC/verification/document → KYC process guide

### Pattern 17-18: Thank You & Goodbye

**Thank You:** Personal acknowledgment + "anything else?" prompt
**Goodbye:** Balance summary + farewell message

---

## 📚 Fallback Knowledge Base

When none of the 18 patterns match, NEO uses a **comprehensive banking knowledge base** that answers any banking question. This is checked **first** (before the data overview) so users get accurate information even when they have accounts.

### Topic Detection

```typescript
const topics: string[] = [];

// Check for specific banking topics via regex
if (/(loan|credit\s*(card|score|limit)|emi|mortgage|borrow)/i.test(msg)) topics.push('loans');
if (/(savings?\s*(account|plan|goal)|fd|fixed\s*deposit|interest\s*(rate|earning))/i.test(msg)) topics.push('savings');
if (/(credit\s*(card|score)|debit\s*card|atm|card\s*(block|lost|replace)|cardless)/i.test(msg)) topics.push('cards');
if (/(upi|neft|rtgs|imps|banking|online\s*banking|mobile\s*banking|net\s*banking)/i.test(msg)) topics.push('digital');
if (/(security|safe|secure|protect|fraud|scam|phish|hack)/i.test(msg)) topics.push('security');
if (/(statement|pdf|download|export|print)/i.test(msg)) topics.push('statements');
if (/(cheque|check\s*book|chequebook|cancel\s*cheque)/i.test(msg)) topics.push('cheque');
if (/(nominee|nri|tax|pan|aadhaar|link)/i.test(msg)) topics.push('services');
if (/(charge|fee|penalty|limit|daily|withdrawal\s*limit)/i.test(msg)) topics.push('limits');
if (/(?:account|open|create|register|new)\b/i.test(msg)) topics.push('help');
if (/(hello|hi|hey|help|what\s*can|what\s*do|capabilit|feature)/i.test(msg)) topics.push('help');
```

### Knowledge Base Topics

| Topic | Questions It Answers | Content |
|-------|---------------------|---------|
| **Loans** | "Tell me about loans", "What loan options?", "How to apply for loan?" | Personal, Home, Auto loan details with rates, tenures, amounts |
| **Savings** | "What are interest rates?", "How does savings work?", "Tell me about FD" | Savings, Fixed Deposit, Recurring Deposit rates and features |
| **Cards** | "How do debit cards work?", "Lost my card!", "What are card limits?" | Debit card, Credit card, Lost/Stolen card procedures |
| **Digital** | "What is UPI?", "How to use NEFT?", "What is online banking?" | UPI, NEFT, RTGS, IMPS, Online Banking features |
| **Security** | "How secure is NeoBank?", "How to protect from fraud?" | 2FA, biometric login, encryption, safety tips, fraud reporting |
| **Statements** | "How to get statement?", "Download PDF?" | E-Statement generation steps |
| **Cheque** | "How to get chequebook?", "How to cancel a cheque?" | Chequebook request, cancellation, digital alternative |
| **Services** | "How to add nominee?", "What is NRI banking?" | Nominee, NRI, Tax, Aadhaar/PAN linking |
| **Limits** | "What are daily limits?", "ATM withdrawal limit?" | ATM, online, POS, international transaction limits |
| **Help** | "What can you help with?", "Features?" | Complete list of NEO's capabilities |

### Fallback Priority Order

```
if (topics.length > 0)           → Show knowledge base answers
else if (full data)               → Financial overview (accounts + txns)
else if (has accounts)            → Account overview only
else if (has transactions)        → Transaction overview only
else                              → Welcome + getting started guide
```

### Knowledge Base Example — Loans

```
## 🏦 NeoBank Loan Services

**Personal Loans**
• Amount: Up to ₹25,00,000
• Interest: Starting from 10.5% p.a.
• Tenure: 12-60 months
• Minimal documentation, quick approval

**Home Loans**
• Amount: Up to ₹5,00,00,000
• Interest: Starting from 8.5% p.a.
• Tenure: Up to 30 years

**Auto Loans**
• Amount: Up to 90% of vehicle value
• Interest: Starting from 9.5% p.a.
• Tenure: 12-84 months

💡 Visit the Loans page to check eligibility and apply online!
```

---

## 🧠 Gemini AI Integration

### Optional Setup

Users can optionally configure a **free Google Gemini API key** for smarter responses:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Click the CPU icon in the chat header
3. Paste the key and save

### How It Works

```typescript
async function initModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}
```

When Gemini is active:

1. **System prompt** is built with the user's complete financial data as JSON
2. **Conversation history** (last 8 messages) is included for context
3. **User question** is sent to Gemini 2.0 Flash
4. **Response** is returned with smart suggestions

```typescript
const result = await model.generateContent(systemPrompt + 
  conversationHistory + userQuestion);
const response = result.response.text();
```

### Error Handling

If Gemini's API call fails:
- Invalid key → Key is cleared from localStorage
- Network error → Falls through to Path 2 (data-driven patterns)
- Rate limiting → Falls through to built-in responses

---

## 💬 Chat UI Component

The `AiChatBot.tsx` component provides a **floating, animated chat interface**.

### Component Tree

```
AiChatBot
├── Floating Button (bottom-right)
│   ├── MessageCircle icon (or X when open)
│   ├── Unread count badge
│   └── Animated pulse ring
│
└── Chat Panel (slide-in)
    ├── Header
    │   ├── NeoBotLogo (animated)
    │   ├── Status indicator (green dot)
    │   ├── AI/Bot badge
    │   ├── API config button
    │   └── Clear chat button
    │
    ├── API Key Setup (collapsible)
    │   ├── API key input
    │   ├── Save button
    │   └── Clear key button
    │
    ├── Messages Area
    │   ├── MessageBubble components
    │   │   ├── User bubble (blue, right-aligned)
    │   │   └── Assistant bubble (card, left-aligned)
    │   │       └── NeoBotLogo (minimal variant)
    │   ├── Typing indicator
    │   │   └── NeoBotLogo (chat variant with waves)
    │   └── Auto-scroll to bottom
    │
    ├── Suggested Replies
    │   └── Clickable suggestion chips
    │
    └── Input Area
        ├── Text input with placeholder
        ├── Send button
        └── Status text (AI/Bot mode)
```

### UI Features

- **Framer Motion animations** — Spring-based transitions, scale effects
- **Markdown rendering** — Bold, headers, code blocks, lists
- **Auto-scroll** — Smooth scroll to latest message
- **Unread badge** — Notification count when minimized
- **Typing indicator** — Animated dots with NeoBotLogo waves
- **Suggested replies** — Context-aware clickable chips
- **Responsive** — Max-width, mobile-friendly

### Message Rendering (Safe HTML)

Messages are rendered with a **safe markdown-to-HTML converter**:

```typescript
// 1. Escape HTML entities to prevent XSS
const escaped = content
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// 2. Convert markdown to HTML
const html = escaped
  .replace(/### (.+)/g, '<h3>$1</h3>')
  .replace(/## (.+)/g, '<h2>$1</h2>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\n/g, '<br/>');
```

**Security:** All user-generated content is HTML-escaped. Only trusted AI-generated or hardcoded text is rendered.

---

## 💾 Conversation History Management

### Storage

Conversations are saved to localStorage under `neobank_chat_history`:

```typescript
const HISTORY_KEY = 'neobank_chat_history';
const MAX_HISTORY = 50;  // Max messages to keep
```

### CRUD Operations

```typescript
// Load history on mount
loadChatHistory(): ChatMessage[]

// Save after each exchange
saveChatHistory(messages: ChatMessage[]): void

// Clear all history
clearChatHistory(): void
```

### What's Stored

Each message includes:
```typescript
interface ChatMessage {
  id: string;           // Unique message ID
  role: 'user' | 'assistant' | 'system';
  content: string;      // Message text (markdown for assistant)
  timestamp: number;    // Date.now()
}
```

---

## 💡 Smart Suggestions

NEO generates **context-aware follow-up suggestions** based on:

### The User's Data State

```typescript
if (dataSnapshot) {
  const hasTransactions = data.transactions.length > 0;
  const hasBeneficiaries = data.beneficiaries.length > 0;
  const lastMsg = lastQuery?.toLowerCase() || '';

  // Based on last query:
  if (lastMsg.includes('balance') || lastMsg.includes('total')) {
    return [
      'Break down my balance by account',
      'Show my recent transactions',
      'Compare this month vs last month',
    ];
  }
  if (lastMsg.includes('transaction') || lastMsg.includes('spend')) {
    return [
      'What is my total balance?',
      'Show spending by category',
      hasBeneficiaries ? 'Who are my beneficiaries?' : 'What interest rates do I have?',
    ];
  }
  // ... more context-aware suggestions
}
```

### No-Data State

When the user isn't logged in:
```
['How do I check my balance?', 'How do I transfer money?', 'What is KYC?', 'What features does NeoBank offer?']
```

---

## ⚡ Real-Time Data Snapshot

### Fetch Strategy

- **Trigger:** Every message send
- **Method:** `buildDataSnapshot()` — async function
- **Parallelism:** `Promise.all()` — 3 API calls in parallel
- **API Source:** Same as UI pages (`accountService.getAccounts()`, etc.)
- **Error Handling:** Each call catches errors, returns empty array
- **Performance:** ~350ms typical response time

### Why This Works

The chatbot uses the **same data path** as the My Accounts page:

```
My Accounts Page:   accountService.getAccounts() → mockAdapter → localStorage
ChatBot:            accountService.getAccounts() → mockAdapter → localStorage
```

This ensures the chatbot always sees the **exact same data** the user sees.

---

## ⚠️ Error Handling & Fallbacks

### Multi-Layered Resilience

```
Layer 1: Gemini AI
         ↓ (if fails)
Layer 2: Data-Driven Patterns (18 patterns)
         ↓ (if no match)
Layer 3: Knowledge Base Fallback
         ↓ (if no data)
Layer 4: Generic Help (not logged in)
```

### Specific Error Scenarios

| Scenario | Handling |
|----------|----------|
| Gemini API key invalid | Clears key, falls to Path 2 |
| Gemini network error | Falls to Path 2 |
| Accounts API fails | Returns empty array, all patterns handle no-accounts gracefully |
| Transactions API fails | Returns empty array, transaction patterns show guidance |
| No data at all (new user) | Comprehensive welcome + getting started guide |
| User not logged in | All patterns return helpful info + login prompt |
| Unknown question | Knowledge base detects topic, or shows capabilities list |

### No-Data Handling Across All 18 Patterns

Every pattern has been designed to handle the case where the user has no accounts or no transactions:

```
Pattern 2 (Balance):
  Has accounts → Show balance breakdown
  No accounts → "Welcome, [Name]! You need to open an account first"
  ↓
  Gives 3 specific next steps:
  1️⃣ Visit "My Accounts" to create a new account
  2️⃣ Go to the Teller Center
  3️⃣ Try "Deposit" with an account number

Pattern 4 (Transactions):
  Has transactions → Show recent activity
  Has accounts, no txns → "Make your first deposit to get started"
  No accounts, no txns → "Open an account, then make your first deposit"
```

---

## 🔄 Complete End-to-End Flow

### User: "What's my total balance?"

```
1. User types "What's my total balance?" → presses Enter
        ↓
2. AiChatBot.handleSend()
   - Creates user ChatMessage { role: 'user', content: 'What's my total balance?' }
   - Sets isLoading = true
        ↓
3. aiService.sendMessage()
   - Builds conversation history from last 8 messages
        ↓
4. buildDataSnapshot()
   - getAuth() → returns { user: Alice Johnson, authenticated: true }
   - Promise.all([
       getAccountsApi() → [{ type: 'savings', balance: 24580.50 }, ...],
       getTransactionsApi() → [{ type: 'credit', ... }, ...],
       getBeneficiariesApi() → [{ name: 'Bob', ... }, ...],
     ])
   - Returns complete DataSnapshot with summary
        ↓
5. PATH 1: No Gemini key → skip
        ↓
6. PATH 2: buildDataResponse(dataSnapshot, message)
   - Tests pattern #1 (greetings): no match
   - Tests pattern #2 (balance): MATCH! ✓
   - Builds response:
     "## 💰 Here's Your Complete Balance Breakdown
      **Savings** (••••3847): ₹24,580.50
      **Checking** (••••5678): ₹8,240.75

      **Total:** ₹32,821.25

      ### Summary
      💼 **Savings:** ₹24,580.50
      💳 **Checking:** ₹8,240.75

      📌 2 of 2 accounts are active."
   - Generates suggestions:
     ['Break down my balance by account',
      'Show my recent transactions',
      'Compare this month vs last month']
        ↓
7. Returns AIChatResponse { message, suggestions }
        ↓
8. AiChatBot receives response
   - Creates assistant ChatMessage
   - Appends to messages array
   - Saves to localStorage (saveChatHistory)
   - Sets suggestions for chips
   - Sets isLoading = false
        ↓
9. User sees animated response with:
   - NeoBotLogo avatar
   - Formatted markdown text
   - Clickable suggestion chips below
```

### User: "Tell me about loans" (no accounts, just info request)

```
1. User types "Tell me about loans"
        ↓
2. aiService.sendMessage()
        ↓
3. buildDataSnapshot() → returns data (user is logged in)
        ↓
4. buildDataResponse()
   - Patterns #1-18 don't match "tell me about loans"
   - Falls to Fallback Knowledge Base
        ↓
5. Topic detection:
   /(loan|credit\s*(card|score|limit)|emi|mortgage|borrow)/i
   ✓ matches "loans"
        ↓
6. topics = ['loans']
   topics.length > 0 → TRUE
        ↓
7. Returns:
   "## 🏦 NeoBank Loan Services

   **Personal Loans**
   • Amount: Up to ₹25,00,000
   • Interest: Starting from 10.5% p.a.
   • Tenure: 12-60 months

   **Home Loans**
   • Amount: Up to ₹5,00,00,000
   • Interest: Starting from 8.5% p.a.
   • Tenure: Up to 30 years

   **Auto Loans**
   • Amount: Up to 90% of vehicle value
   • Interest: Starting from 9.5% p.a.

   💡 Visit the Loans page to check eligibility and apply online!"
```

### User: Not Logged In, "How do I transfer money?"

```
1. User types "How do I transfer money?" (not logged in)
        ↓
2. buildDataSnapshot() → getAuth() returns null → returns null
        ↓
3. PATH 1: No Gemini → skip
        ↓
4. PATH 2: dataSnapshot is null → skip
        ↓
5. PATH 3: msg.includes('transfer') → true
        ↓
6. Returns:
   "## 💸 Transferring Money

   Log in and I can help you with transfers. Here's how:
   1. Go to "Transfer Funds" from the sidebar
   2. Select your source account
   3. Choose a saved beneficiary or enter an account number
   4. Enter the amount and description
   5. Confirm — processed instantly!

   💡 You can also ask me "Send ₹1000 to Bob" once you're logged in!"
```

---

## 🧩 Extending NEO

### Adding a New Query Pattern

1. Add the pattern check in `buildDataResponse()`:
```typescript
// ── 19. NEW PATTERN ──
if (msg.includes('investment') || msg.includes('mutual fund')) {
  // Check for data
  // Build response with actual data
  // Return with suggestions
}
```

2. Add no-data handling:
```typescript
if (data.accounts.length === 0) {
  return {
    message: 'You need an account to invest. Open one from My Accounts!',
    suggestions: generateSuggestions(data, msg),
  };
}
```

### Adding a Knowledge Base Topic

1. Add the topic detection regex:
```typescript
if (/(investment|mutual\s*fund|stock|market)/i.test(msg)) topics.push('investments');
```

2. Add the topic answer:
```typescript
const topicAnswers = {
  'loans': '...',
  'investments': 
    '## 📈 NeoBank Investment Services\n\n' +
    '**Mutual Funds**\n' +
    '• Start with as low as ₹500\n' +
    '• Equity, Debt, Hybrid funds available\n' +
    '• Easy redemption within 24 hours\n\n' +
    '**Fixed Deposits**\n' +
    '• Guaranteed returns\n' +
    '• Flexible tenure options\n\n' +
    '💡 Visit the Investments page to explore options!',
};
```

### Customizing the Welcome Message

Edit the welcome message in `AiChatBot.tsx`:
```typescript
const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '👋 Hello! I\'m **NEO**, your AI banking assistant.\n\nHow can I help you today?',
  timestamp: Date.now(),
};
```

---

## 📊 Performance & Technical Details

### Response Times

| Scenario | Typical Time | Notes |
|----------|-------------|-------|
| Data-driven (no API) | 300-500ms | 3 parallel API calls + pattern matching |
| Gemini API | 1-3 seconds | Depends on API response time |
| Generic help (no login) | <10ms | Pure string matching, no data fetch |

### Bundle Impact

| File | Size |
|------|------|
| `aiService.ts` | ~25KB (includes knowledge base text) |
| `AiChatBot.tsx` | ~15KB (includes UI components) |
| `NeoBotLogo.tsx` | ~3KB (SVG animation) |

### localStorage Usage

| Key | Content | Max Size |
|-----|---------|----------|
| `neobank_chat_history` | Message array | ~50 messages |
| `neobank_gemini_api_key` | Encoded API key | ~100 chars |

---

## 📝 Summary

NEO is a **complete, production-ready AI banking assistant** that works on three levels:

| Path | When It Runs | Data Source | API Key Needed? |
|------|-------------|-------------|-----------------|
| **Gemini AI** | Optional — if API key is configured | Real user data + AI generation | ✅ Yes |
| **Data-Driven Patterns** | Default — user is logged in | Real user data (18 patterns) | ❌ No |
| **Generic Help** | User is not logged in | Static guides + login prompts | ❌ No |

### Key Design Principles

1. **Data first** — Always fetch real data, never make up numbers
2. **Resilience** — Multi-layered fallbacks ensure every question gets an answer
3. **Same data as UI** — Uses the same APIs as page components
4. **No-accounts friendly** — Every pattern handles empty data gracefully
5. **Knowledge base** — Answers ANY banking question even without accounts
6. **Zero config** — Works perfectly without any API key

---

*Built with ❤️ for NeoBank — A modern digital banking platform*
