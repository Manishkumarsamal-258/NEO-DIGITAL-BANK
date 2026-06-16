/**
 * ── NeoBank AI Assistant Service ─────────────────────────────
 * A powerful AI banking assistant that provides DIRECT answers
 * using REAL user data from the app (accounts, transactions,
 * beneficiaries, etc.).
 *
 * Features:
 * - Google Gemini API integration (optional, free tier)
 * - Real-time data snapshot from localStorage
 * - Gemini instructed to analyze and answer from actual data
 * - Dynamic data-driven responses work forever with NO API key
 * - Comprehensive NLP-style query matching for any question
 * - Direct answers with actual computed data (not instructions)
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { formatCurrency } from '@/lib/mockData';
import { getAuth } from '@/services/authService';
import { getAccounts as getAccountsApi } from '@/services/accountService';
import { getTransactions as getTransactionsApi } from '@/services/transactionService';
import { getBeneficiaries as getBeneficiariesApi } from '@/services/beneficiaryService';

// ── Types ──────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIChatResponse {
  message: string;
  suggestions?: string[];
}

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
    type: string;
    number: string;
    balance: number;
    currency: string;
    status: string;
    interestRate: number;
  }>;
  transactions: Array<{
    type: string;
    amount: number;
    currency: string;
    status: string;
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

// ── Configuration ──────────────────────────────────────────

const STORAGE_KEY = 'neobank_gemini_api_key';
const HISTORY_KEY = 'neobank_chat_history';
const MAX_HISTORY = 50;
const MODEL_NAME = 'gemini-2.0-flash';

// ── System Prompt ──────────────────────────────────────────

function buildSystemPrompt(dataSnapshot: DataSnapshot): string {
  return `You are "NEO", an AI banking assistant for NeoBank. You have been given the user's REAL financial data below. Your ONLY source of truth is this data — use it to answer every question accurately.

## YOUR DATA RULES
1. ALWAYS answer based on the actual data provided below. Never make up numbers.
2. When asked "what is my balance", calculate from the accounts data.
3. When asked about transactions, analyze the transaction records.
4. Calculate totals, summaries, categories, and trends from the provided data.
5. If asked about something not in the data, say "I don't have that information available."
6. Use proper currency formatting: ₹ for INR, $ for USD.
7. Use the user's name when addressing them.

## USER'S REAL-TIME FINANCIAL DATA
\`\`\`json
${JSON.stringify(dataSnapshot, null, 2)}
\`\`\`

## CAPABILITIES
You can:
- Answer questions about account balances, totals, and breakdowns
- List recent transactions and categorize spending
- Calculate monthly income vs expenses
- Explain transaction statuses
- Provide insights on spending patterns
- Answer general banking questions

## RESPONSE FORMAT
- Be concise but thorough (aim for 2-4 paragraphs)
- Use markdown for clarity (bold for amounts, lists for items)
- Start with a brief acknowledgment of the question
- End with a helpful suggestion or follow-up question
- If the user greets you, greet them back and briefly summarize their financial status`;
}

// ── Build Real-Time Data Snapshot ──────────────────────────

async function buildDataSnapshot(): Promise<DataSnapshot | null> {
  // Get the current user from authService (same as My Accounts page)
  const { user } = getAuth();
  if (!user) return null;

  // Fetch accounts, transactions, and beneficiaries in parallel through the SAME API
  // that the My Accounts page uses (accountService -> mockAdapter -> mockData)
  let allAccounts: DataSnapshot['accounts'] = [];
  let allTransactions: DataSnapshot['transactions'] = [];
  let userBeneficiaries: DataSnapshot['beneficiaries'] = [];

  const [accountsResult, transactionsResult, beneficiariesResult] = await Promise.all([
    getAccountsApi()
      .then(accounts => accounts.map(a => ({
        type: a.accountType,
        number: a.accountNumber,
        balance: a.balance,
        currency: a.currency,
        status: a.status,
        interestRate: a.interestRate,
      })))
      .catch((e: unknown) => { console.warn('[AIService] Failed to fetch accounts:', e); return []; }),
    getTransactionsApi()
      .then(transactions => transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      .catch((e: unknown) => { console.warn('[AIService] Failed to fetch transactions:', e); return []; }),
    getBeneficiariesApi()
      .then(beneficiaries => beneficiaries.map(b => ({
        name: b.name,
        nickname: b.nickname || b.name,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
      })))
      .catch((e: unknown) => { console.warn('[AIService] Failed to fetch beneficiaries:', e); return []; }),
  ]);

  allAccounts = accountsResult;
  allTransactions = transactionsResult;
  userBeneficiaries = beneficiariesResult;

  const totalBalance = allAccounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      memberSince: user.createdAt,
      phone: user.phone || 'Not provided',
    },
    accounts: allAccounts,
    transactions: allTransactions,
    beneficiaries: userBeneficiaries,
    summary: {
      totalBalance,
      totalAccounts: allAccounts.length,
      activeAccounts: allAccounts.filter(a => a.status === 'active').length,
      totalTransactions: allTransactions.length,
    },
  };
}

// ── Gemini Model Init ──────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function initModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: MODEL_NAME });
}

// ── Build Conversation History ─────────────────────────────

function buildConversationHistory(messages: ChatMessage[]): string {
  return messages
    .slice(-8)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

// ── Generate Smart Suggestions Based on Data & Query ───────

function generateSuggestions(dataSnapshot: DataSnapshot | null, lastQuery?: string): string[] {
  if (dataSnapshot) {
    const hasTransactions = dataSnapshot.transactions.length > 0;
    const hasBeneficiaries = dataSnapshot.beneficiaries.length > 0;
    const lastMsg = lastQuery?.toLowerCase() || '';

    // Context-aware suggestions based on last query
    if (lastMsg.includes('balance') || lastMsg.includes('total')) {
      return [
        'Break down my balance by account',
        'Show my recent transactions',
        'Compare this month vs last month',
      ];
    }
    if (lastMsg.includes('transaction') || lastMsg.includes('spend') || lastMsg.includes('expense')) {
      return [
        'What is my total balance?',
        'Show spending by category',
        hasBeneficiaries ? 'Who are my beneficiaries?' : 'What interest rates do I have?',
      ];
    }
    if (lastMsg.includes('beneficiar') || lastMsg.includes('payee')) {
      return [
        'How do I add a beneficiary?',
        'What is my total balance?',
        'Show my recent transactions',
      ];
    }

    return [
      'What is my total balance?',
      ...(hasTransactions ? ['Show me my recent transactions'] : []),
      ...(hasBeneficiaries ? ['Who are my beneficiaries?'] : []),
      'What can you help me with?',
    ].slice(0, 4);
  }

  return [
    'How do I check my balance?',
    'How do I transfer money?',
    'What is KYC verification?',
    'What features does NeoBank offer?',
  ];
}

// ── Build Direct Data-Driven Response ──────────────────────

function buildDataResponse(data: DataSnapshot, msg: string): AIChatResponse | null {
  // ── 1. GREETINGS ──
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening|day|mrng|mng))/i.test(msg)) {
    const unreadCount = data.transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
    return {
      message:
        '👋 Hello **' + data.user.name + '**! Great to see you.\n\n' +
        'Here\'s your **financial snapshot**:\n\n' +
        '💰 **Total Balance:** ' + formatCurrency(data.summary.totalBalance) + '\n' +
        '🏦 **Accounts:** ' + data.summary.activeAccounts + ' active of ' + data.summary.totalAccounts + '\n' +
        '📊 **Recent Activity:** ' + data.transactions.length + ' transactions\n' +
        (data.beneficiaries.length > 0 ? '👥 **Beneficiaries:** ' + data.beneficiaries.length + ' saved\n' : '') +
        (unreadCount > 0 ? '⏳ **Pending Items:** ' + unreadCount + ' transaction' + (unreadCount > 1 ? 's' : '') + ' need attention\n\n' : '\n') +
        'What would you like to know? I can give you exact numbers on anything!',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 2. TOTAL BALANCE ──
  if (
    msg.includes('balance') || msg.includes('total') || msg.includes('how much money') ||
    msg.includes('net worth') || msg.includes('all my money') || msg.includes('what do i have')
  ) {
    if (data.accounts.length === 0) {
      return {
        message:
          'Welcome, **' + data.user.name + '**! 👋\n\n' +
          'I see you\'re logged in but currently there are **no accounts** linked to your profile.\n\n' +
          'Here\'s what you can do:\n' +
          '1️⃣ Visit **"My Accounts"** to create a new account\n' +
          '2️⃣ Go to the **Teller Center** if you need assisted account opening\n' +
          '3️⃣ Try **"Deposit"** if you have an account number ready\n\n' +
          'Would you like me to help you with something else?',
        suggestions: ['How do I open an account?', 'What features does NeoBank offer?', 'Show my profile'],
      };
    }

    const lines = data.accounts.map(a => {
      const label = a.type.charAt(0).toUpperCase() + a.type.slice(1);
      const amt = formatCurrency(a.balance, a.currency);
      const suffix = a.status !== 'active' ? ' — *' + a.status + '*' : '';
      return '**' + label + '** (••••' + a.number.slice(-4) + '): ' + amt + suffix;
    });

    // Compute some insight
    const savings = data.accounts.filter(a => a.type === 'savings');
    const checking = data.accounts.filter(a => a.type === 'checking');
    const savingsTotal = savings.reduce((s, a) => s + a.balance, 0);
    const checkingTotal = checking.reduce((s, a) => s + a.balance, 0);

    const insightLines: string[] = [];
    if (savings.length > 0) {
      insightLines.push('💼 **Savings:** ' + formatCurrency(savingsTotal) + ' across ' + savings.length + ' account' + (savings.length > 1 ? 's' : ''));
    }
    if (checking.length > 0) {
      insightLines.push('💳 **Checking:** ' + formatCurrency(checkingTotal) + ' across ' + checking.length + ' account' + (checking.length > 1 ? 's' : ''));
    }

    return {
      message:
        '## 💰 Here\'s Your Complete Balance Breakdown\n\n' +
        lines.join('\n\n') + '\n\n' +
        '**Total:** ' + formatCurrency(data.summary.totalBalance) + '\n\n' +
        '### Summary\n' +
        insightLines.join('\n') + '\n\n' +
        '📌 ' + data.summary.activeAccounts + ' of ' + data.summary.totalAccounts + ' accounts are active.',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 3. SPECIFIC ACCOUNT TYPE ──
  const savingsMatch = msg.match(/savings?\s*(account|balance|amount)?/i);
  const checkingMatch = msg.match(/^(?=.*\bchecking\b).*$/i) || msg.match(/checking\s*(account|balance|amount)?/i);
  if (savingsMatch || checkingMatch) {
    const type = savingsMatch ? 'savings' : 'checking';
    const accounts = data.accounts.filter(a => a.type === type);

    if (accounts.length === 0) {
      return {
        message: 'You don\'t have any **' + type + ' accounts** yet. Visit the Teller Center to open one.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const lines = accounts.map(a => {
      const amt = formatCurrency(a.balance, a.currency);
      return '**' + a.number + '**\n' +
        '  • Balance: ' + amt + '\n' +
        '  • Status: ' + a.status + '\n' +
        (a.interestRate > 0 ? '  • Interest Rate: ' + a.interestRate + '% p.a.' : '');
    });

    const total = accounts.reduce((s, a) => s + a.balance, 0);

    return {
      message:
        '## 🏦 Your ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Account' + (accounts.length > 1 ? 's' : '') + '\n\n' +
        lines.join('\n\n') + '\n\n' +
        '**Total in ' + type + ':** ' + formatCurrency(total),
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 4. RECENT TRANSACTIONS / ACTIVITY ──
  if (
    msg.includes('transaction') || msg.includes('history') || msg.includes('recent') ||
    msg.includes('activity') || msg.includes('last') || msg.includes('latest')
  ) {
    if (data.transactions.length === 0) {
      if (data.accounts.length === 0) {
        return {
          message:
            'You don\'t have any accounts yet, **' + data.user.name + '**.\n\n' +
            'Once you open an account and make your first deposit, your transaction history will appear here.\n\n' +
            'Here\'s how to get started:\n' +
            '1️⃣ **Open an account** — Go to My Accounts and create a savings or checking account\n' +
            '2️⃣ **Make a deposit** — Add funds through the Deposit page\n' +
            '3️⃣ **Send money** — Transfer to friends or pay bills\n\n' +
            'Would you like me to guide you through any of these steps?',
          suggestions: ['How do I open an account?', 'How do I deposit money?', 'What features does NeoBank offer?'],
        };
      }
      return {
        message: 'You have no transactions yet. Make a deposit or transfer to get started!',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const credits = data.transactions.filter(t => t.type === 'credit');
    const debits = data.transactions.filter(t => t.type === 'debit' || t.type === 'transfer');
    const totalCredits = credits.reduce((s, t) => s + t.amount, 0);
    const totalDebits = debits.reduce((s, t) => s + t.amount, 0);
    const pending = data.transactions.filter(t => t.status === 'pending' || t.status === 'processing');

    const txnLines = data.transactions.slice(0, 5).map(t => {
      const sign = t.type === 'credit' ? '⬆️' : '⬇️';
      return sign + ' **' + t.description + '** — ' + formatCurrency(t.amount, t.currency) +
        ' · ' + new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
        ' · `' + t.status + '`';
    });

    return {
      message:
        '## 📊 Your Recent Activity\n\n' +
        '**Income:** ' + formatCurrency(totalCredits) + ' (' + credits.length + ' transaction' + (credits.length !== 1 ? 's' : '') + ')\n' +
        '**Spent:** ' + formatCurrency(totalDebits) + ' (' + debits.length + ' transaction' + (debits.length !== 1 ? 's' : '') + ')\n' +
        (pending.length > 0 ? '⏳ **Pending:** ' + pending.length + ' transaction' + (pending.length > 1 ? 's' : '') + '\n' : '') +
        '\n### Latest ' + Math.min(5, data.transactions.length) + ' Transactions\n\n' +
        txnLines.join('\n') +
        '\n\n💡 Ask me about spending by category or specific transactions!',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 5. SPENDING BY CATEGORY ──
  if (
    msg.includes('spend') || msg.includes('expense') || msg.includes('category') ||
    msg.includes('categor') || msg.includes('where') || msg.includes('budget') ||
    msg.includes('going')
  ) {
    if (data.transactions.length === 0) {
      if (data.accounts.length === 0) {
        return {
          message:
            '**' + data.user.name + '**, you don\'t have any spending data yet because you haven\'t opened an account.\n\n' +
            'Once you have an account and start transacting, I can show you:\n' +
            '📊 **Spending by category** — See where your money goes (food, rent, shopping, etc.)\n' +
            '📈 **Monthly trends** — Track your spending patterns over time\n' +
            '💰 **Budget insights** — Identify areas where you can save\n\n' +
            'To get started, open an account from **My Accounts** page!',
          suggestions: ['How do I open an account?', 'How do I deposit money?', 'What are the interest rates?'],
        };
      }
      return {
        message: 'No spending data available yet. Your spending will appear here once you make transactions.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const categories: Record<string, number> = {};
    data.transactions.filter(t => t.type === 'debit' || t.type === 'transfer').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return {
        message: 'No spending data available yet. Your spending will appear here once you make transactions.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const totalSpent = sorted.reduce((s, [, amt]) => s + amt, 0);
    const maxCategory = sorted[0][0];
    const maxAmount = sorted[0][1];
    const pctOfTotal = ((maxAmount / totalSpent) * 100).toFixed(0);

    const lines = sorted.map(([cat, amt]) => {
      const pct = ((amt / totalSpent) * 100).toFixed(1);
      return '• **' + cat + ':** ' + formatCurrency(amt) + ' (' + pct + '%)';
    });

    return {
      message:
        '## 📈 Spending Breakdown\n\n' +
        '**Total Spent:** ' + formatCurrency(totalSpent) + '\n' +
        '**Top Category:** ' + maxCategory + ' (' + pctOfTotal + '% of spending)\n\n' +
        '### By Category\n\n' +
        lines.join('\n') +
        '\n\n💡 Your biggest expense is **' + maxCategory + '** at ' + pctOfTotal + '% of total spending.',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 6. INCOME vs EXPENSES ──
  if (
    msg.includes('income') || msg.includes('earning') || msg.includes('salary') ||
    msg.includes('vs') || msg.includes('compare') || msg.includes('profit') ||
    msg.includes('inflow') || msg.includes('outflow')
  ) {
    if (data.transactions.length === 0) {
      if (data.accounts.length === 0) {
        return {
          message:
            '**' + data.user.name + '**, you don\'t have any income or expense data yet.\n\n' +
            'Income vs Expenses tracking helps you understand your financial health.\n' +
            'Once you open an account and start transacting, I can show you:\n' +
            '⬆️ **Income** — Salary, deposits, credits\n' +
            '⬇️ **Expenses** — Bills, shopping, transfers\n' +
            '📊 **Net position** — Are you saving or spending more?\n\n' +
            'Open an account from **My Accounts** to get started!',
          suggestions: ['How do I open an account?', 'Show my profile', 'What can you help me with?'],
        };
      }
      return {
        message: 'No income or expense data yet. Make a deposit or transfer to start tracking!',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const credits = data.transactions.filter(t => t.type === 'credit');
    const debits = data.transactions.filter(t => t.type === 'debit' || t.type === 'transfer');
    const totalIncome = credits.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = debits.reduce((s, t) => s + t.amount, 0);
    const netFlow = totalIncome - totalExpenses;

    return {
      message:
        '## 💵 Income vs Expenses\n\n' +
        '**Income:** ' + formatCurrency(totalIncome) + ' (' + credits.length + ' transaction' + (credits.length !== 1 ? 's' : '') + ')\n' +
        '**Expenses:** ' + formatCurrency(totalExpenses) + ' (' + debits.length + ' transaction' + (debits.length !== 1 ? 's' : '') + ')\n' +
        '**Net Flow:** ' + (netFlow >= 0 ? '✅ +' : '🔴 ') + formatCurrency(Math.abs(netFlow)) + '\n\n' +
        (netFlow >= 0
          ? 'You\'re in a positive position! Income exceeds expenses by ' + formatCurrency(netFlow) + '.'
          : 'Your expenses exceed income by ' + formatCurrency(Math.abs(netFlow)) + '. Consider reviewing your spending.'),
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 7. BENEFICIARIES ──
  if (msg.includes('beneficiar') || msg.includes('payee') || msg.includes('recipient') || msg.includes('saved')) {
    if (data.beneficiaries.length === 0) {
      return {
        message: 'You don\'t have any beneficiaries saved yet. Go to the **Beneficiaries** page to add one for faster transfers.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const lines = data.beneficiaries.map((b, i) =>
      (i + 1) + '. **' + b.nickname + '** — ' + b.bankName + ' — `' + b.accountNumber + '`'
    );

    return {
      message:
        '## 👥 Your Beneficiaries (' + data.beneficiaries.length + ')\n\n' +
        lines.join('\n') +
        '\n\n💡 You can send money to any of them instantly from the Transfer page!',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 8. ACCOUNT NUMBERS ──
  if (
    msg.includes('account number') || msg.includes('my account') ||
    msg.includes('account detail') || msg.includes('acc no') ||
    msg.includes('what accounts') || msg.includes('which account')
  ) {
    if (data.accounts.length === 0) {
      return {
        message:
          'Hi **' + data.user.name + '**, you don\'t have any accounts set up yet.\n\n' +
          'To get started:\n' +
          '1️⃣ Go to **"My Accounts"** from the sidebar\n' +
          '2️⃣ Click **Open New Account**\n' +
          '3️⃣ Choose account type (Savings, Checking, or Fixed Deposit)\n' +
          '4️⃣ Your account will be created instantly!',
        suggestions: ['How do I open an account?', 'What is my profile info?', 'What interest rates are available?'],
      };
    }

    const lines = data.accounts.map(a => {
      const label = a.type.charAt(0).toUpperCase() + a.type.slice(1);
      return '**' + label + '**\n  • Number: `' + a.number + '`\n  • Balance: ' + formatCurrency(a.balance, a.currency) + '\n  • Status: ' + a.status;
    });

    return {
      message:
        '## 🏦 Your Accounts\n\n' +
        lines.join('\n\n') +
        '\n\nYou have **' + data.summary.activeAccounts + ' active** of ' + data.summary.totalAccounts + ' accounts.',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 9. INTEREST RATES ──
  if (msg.includes('interest') || msg.includes('rate') || msg.includes('return') || msg.includes('apy') || msg.includes('apr')) {
    const savings = data.accounts.filter(a => a.type === 'savings');
    const checking = data.accounts.filter(a => a.type === 'checking');
    const fd = data.accounts.filter(a => a.type === 'fixed_deposit');

    if (savings.length === 0 && checking.length === 0 && fd.length === 0) {
      return {
        message:
          'Hi **' + data.user.name + '**, here are the standard NeoBank interest rates:\n\n' +
          '**Savings Accounts:** 3.5% p.a.\n' +
          '**Checking Accounts:** 0.5% p.a.\n' +
          '**Fixed Deposits:** 5.0% - 7.0% p.a. (varies by tenure)\n\n' +
          '💡 Interest is calculated on daily balance and credited quarterly.\n' +
          'Open a savings account to start earning interest!',
        suggestions: ['How do I open a savings account?', 'Show my profile', 'What can you help me with?'],
      };
    }

    let message = '## 💹 Current Interest Rates\n\n';

    if (savings.length > 0) {
      const rate = savings[0].interestRate;
      const total = savings.reduce((s, a) => s + a.balance, 0);
      const yearlyInterest = total * (rate / 100);
      message += '**Savings Accounts:** ' + rate + '% p.a.\n';
      message += '  → On your balance of ' + formatCurrency(total) + ', you\'ll earn **' + formatCurrency(yearlyInterest) + '** in interest this year.\n\n';
    }
    if (checking.length > 0) {
      message += '**Checking Accounts:** ' + checking[0].interestRate + '% p.a.\n\n';
    }
    if (fd.length > 0) {
      message += '**Fixed Deposits:** ' + fd[0].interestRate + '% p.a.\n\n';
    }

    message += '💡 Interest is calculated on daily balance and credited quarterly.';

    return { message, suggestions: generateSuggestions(data, msg) };
  }

  // ── 10. LAST TRANSACTION ──
  if (msg.includes('last transaction') || msg.includes('most recent') || msg.includes('latest transaction')) {
    if (data.transactions.length === 0) {
      if (data.accounts.length === 0) {
        return {
          message:
            'You don\'t have any transactions yet, **' + data.user.name + '**.\n\n' +
            'Your transaction history will appear here once you:\n' +
            '1️⃣ **Open an account** — Create one from My Accounts\n' +
            '2️⃣ **Make a deposit** — Add funds to your new account\n' +
            '3️⃣ **Transfer money** — Send or receive payments\n\n' +
            'Each transaction records the amount, date, status, and description!',
          suggestions: ['How do I open an account?', 'How do I deposit money?', 'Show my profile'],
        };
      }
      return {
        message: 'You have no transactions yet. Make a deposit or transfer to get started!',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const t = data.transactions[0];
    const sign = t.type === 'credit' ? '⬆️' : '⬇️';

    return {
      message:
        '## 🕐 Your Most Recent Transaction\n\n' +
        sign + ' **' + t.description + '**\n' +
        '• **Amount:** ' + formatCurrency(t.amount, t.currency) + '\n' +
        '• **Type:** ' + t.type.charAt(0).toUpperCase() + t.type.slice(1) + '\n' +
        '• **Status:** `' + t.status + '`\n' +
        '• **Date:** ' + new Date(t.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '\n' +
        '• **Category:** ' + t.category,
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 11. SPECIFIC CATEGORY SPENDING ──
  const categoryMap: Record<string, string[]> = {
    'food|grocery|eat|restaurant|dining|lunch|dinner|breakfast': ['Groceries', 'Food & Dining'],
    'rent|housing|home|mortgage|property': ['Housing', 'Rent', 'Property'],
    'entertain|netflix|movie|game|spotify|fun': ['Entertainment'],
    'transport|gas|fuel|uber|lyft|cab|metro': ['Transportation', 'Fuel'],
    'shopping|cloth|amazon|flipkart|retail': ['Shopping', 'Clothing'],
    'bill|electricity|water|utility|phone|internet': ['Utilities', 'Bills'],
    'health|medical|doctor|hospital|pharmacy': ['Healthcare', 'Medical'],
    'education|school|college|course|tution': ['Education'],
    'travel|hotel|flight|vacation|trip': ['Travel', 'Hotel'],
    'salary|income|pay|payment|received': ['Income', 'Salary'],
  };

  for (const [pattern, categories] of Object.entries(categoryMap)) {
    if (new RegExp(pattern).test(msg)) {
      const matchedTransactions = data.transactions.filter(t =>
        categories.some(c => t.category.toLowerCase().includes(c.toLowerCase()))
      );

      if (matchedTransactions.length === 0) {
        // Check if user asked about income/salary
        if (pattern === 'salary|income|pay|payment|received') {
          const allCredits = data.transactions.filter(t => t.type === 'credit');
          if (allCredits.length > 0) {
            const total = allCredits.reduce((s, t) => s + t.amount, 0);
            return {
              message:
                '## 💵 Your Income\n\n' +
                '**Total Income:** ' + formatCurrency(total) + ' across ' + allCredits.length + ' transaction' + (allCredits.length > 1 ? 's' : '') + '\n\n' +
                allCredits.map(t => '⬆️ **' + t.description + '** — ' + formatCurrency(t.amount) + ' · ' + new Date(t.date).toLocaleDateString()).join('\n'),
              suggestions: generateSuggestions(data, msg),
            };
          }
        }
        return {
          message: 'I couldn\'t find any transactions in this category yet.',
          suggestions: generateSuggestions(data, msg),
        };
      }

      const total = matchedTransactions.reduce((s, t) => s + t.amount, 0);
      const lines = matchedTransactions.slice(0, 5).map(t =>
        (t.type === 'credit' ? '⬆️' : '⬇️') + ' **' + t.description + '** — ' + formatCurrency(t.amount) + ' · ' + new Date(t.date).toLocaleDateString()
      );

      return {
        message:
          '## 🏷️ Spending on ' + categories[0] + '\n\n' +
          '**Total:** ' + formatCurrency(total) + ' (' + matchedTransactions.length + ' transaction' + (matchedTransactions.length > 1 ? 's' : '') + ')\n\n' +
          lines.join('\n') +
          (matchedTransactions.length > 5 ? '\n\n… and ' + (matchedTransactions.length - 5) + ' more' : ''),
        suggestions: generateSuggestions(data, msg),
      };
    }
  }

  // ── 12. ACCOUNT STATUS ──
  if (msg.includes('status') || msg.includes('active') || msg.includes('frozen') || msg.includes('closed')) {
    if (data.accounts.length === 0) {
      return {
        message:
          'Hi **' + data.user.name + '**, you don\'t have any accounts yet.\n\n' +
          'Once you open an account, I can tell you its status (active, frozen, or closed).',
        suggestions: ['How do I open an account?', 'Show my profile', 'What can you help me with?'],
      };
    }

    const active = data.accounts.filter(a => a.status === 'active');
    const frozen = data.accounts.filter(a => a.status === 'frozen');
    const closed = data.accounts.filter(a => a.status === 'closed');

    let message = '## 📋 Account Status Summary\n\n';
    message += '✅ **Active:** ' + active.length + ' account' + (active.length !== 1 ? 's' : '') + '\n';
    if (frozen.length > 0) message += '❄️ **Frozen:** ' + frozen.length + ' account' + (frozen.length !== 1 ? 's' : '') + '\n';
    if (closed.length > 0) message += '🔒 **Closed:** ' + closed.length + ' account' + (closed.length !== 1 ? 's' : '') + '\n\n';

    if (active.length > 0) {
      message += '**Active Accounts:**\n' +
        active.map(a => '• **' + a.type.charAt(0).toUpperCase() + a.type.slice(1) + '** — ' + formatCurrency(a.balance, a.currency)).join('\n');
    }

    return { message, suggestions: generateSuggestions(data, msg) };
  }

  // ── 13. MEMBER SINCE / PROFILE ──
  if (msg.includes('profile') || msg.includes('member') || msg.includes('joined') || msg.includes('since') || msg.includes('info about me')) {
    const daysSince = Math.floor((Date.now() - new Date(data.user.memberSince).getTime()) / (1000 * 60 * 60 * 24));

    return {
      message:
        '## 👤 Your Profile\n\n' +
        '**Name:** ' + data.user.name + '\n' +
        '**Email:** ' + data.user.email + '\n' +
        '**Phone:** ' + (data.user.phone !== 'Not provided' ? data.user.phone : 'Not set') + '\n' +
        '**Role:** ' + data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1) + '\n' +
        '**Status:** ' + data.user.status + '\n' +
        '**Member Since:** ' + new Date(data.user.memberSince).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) +
        ' (' + daysSince + ' day' + (daysSince !== 1 ? 's' : '') + ' ago)',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 14. PENDING / FAILED TRANSACTIONS ──
  if (msg.includes('pending') || msg.includes('failed') || msg.includes('issue') || msg.includes('problem')) {
    const pending = data.transactions.filter(t => t.status === 'pending' || t.status === 'processing');
    const failed = data.transactions.filter(t => t.status === 'failed');

    if (pending.length === 0 && failed.length === 0) {
      return {
        message: 'All your transactions are in good standing! No pending or failed transactions found.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const lines: string[] = [];
    if (pending.length > 0) {
      lines.push('### ⏳ Pending (' + pending.length + ')');
      pending.forEach(t => {
        lines.push('• **' + t.description + '** — ' + formatCurrency(t.amount) + ' · ' + new Date(t.date).toLocaleDateString());
      });
    }
    if (failed.length > 0) {
      lines.push('### ❌ Failed (' + failed.length + ')');
      failed.forEach(t => {
        lines.push('• **' + t.description + '** — ' + formatCurrency(t.amount) + ' · ' + new Date(t.date).toLocaleDateString());
      });
    }

    return {
      message:
        '## ⚠️ Transactions Needing Attention\n\n' +
        lines.join('\n') +
        '\n\nContact support if you need help with any of these.',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 15. THIS MONTH vs LAST MONTH ──
  if (
    msg.includes('month') || msg.includes('this month') || msg.includes('last month') ||
    msg.includes('weekly') || msg.includes('this week') || msg.includes('period')
  ) {
    if (data.transactions.length === 0) {
      if (data.accounts.length === 0) {
        return {
          message:
            '**' + data.user.name + '**, you don\'t have any monthly data yet.\n\n' +
            'Once you have an account and start transacting, I can show you:\n' +
            '📅 **This month vs last month** — Compare your income and expenses\n' +
            '📈 **Trends** — See if you\'re saving more or spending less\n' +
            '💰 **Monthly net position** — Track your financial progress\n\n' +
            'Open an account from **My Accounts** to get started!',
          suggestions: ['How do I open an account?', 'What are the interest rates?', 'Show my profile'],
        };
      }
      return {
        message: 'No transaction data available for recent months. Make a deposit or transfer first!',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthTxns = data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const lastMonthTxns = data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    if (thisMonthTxns.length === 0 && lastMonthTxns.length === 0) {
      return {
        message: 'No transaction data available for recent months.',
        suggestions: generateSuggestions(data, msg),
      };
    }

    const thisIncome = thisMonthTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisMonthTxns.filter(t => t.type === 'debit' || t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonthTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const lastExpense = lastMonthTxns.filter(t => t.type === 'debit' || t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

    const monthName = (m: number) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];

    return {
      message:
        '## 📅 Monthly Comparison\n\n' +
        '### ' + monthName(currentMonth) + ' ' + currentYear + '\n' +
        'Income: ' + formatCurrency(thisIncome) + ' | Expenses: ' + formatCurrency(thisExpense) + ' | Net: ' + formatCurrency(thisIncome - thisExpense) + '\n\n' +
        '### ' + monthName(lastMonth) + ' ' + lastMonthYear + '\n' +
        'Income: ' + formatCurrency(lastIncome) + ' | Expenses: ' + formatCurrency(lastExpense) + ' | Net: ' + formatCurrency(lastIncome - lastExpense) + '\n\n' +
        (thisMonthTxns.length > 0
          ? '### This Month\'s Transactions (' + thisMonthTxns.length + ')\n' +
            thisMonthTxns.slice(0, 5).map(t =>
              (t.type === 'credit' ? '⬆️' : '⬇️') + ' **' + t.description + '** — ' + formatCurrency(t.amount)
            ).join('\n')
          : 'No transactions this month yet.'),
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 16. HOW DO I / HELP WITH SPECIFIC ACTIONS ──
  // NOTE: 'what is' and 'can i' are NOT in this pattern intentionally — they
  // would catch data-driven queries like "What is my balance?" before the
  // data-specific patterns above can respond with actual account data.
  if (
    msg.includes('how do i') || msg.includes('how to') || msg.includes('help me') ||
    msg.includes('guide')
  ) {
    if (msg.includes('transfer') || msg.includes('send') || msg.includes('pay')) {
      return {
        message:
          '## 💸 How to Transfer Money\n\n' +
          '1. Go to **"Transfer Funds"** in the sidebar\n' +
          '2. Select your source account\n' +
          '3. Choose a beneficiary or enter an account number\n' +
          '4. Enter amount and description\n' +
          '5. Confirm — done instantly!\n\n' +
          (data.beneficiaries.length > 0
            ? 'You have **' + data.beneficiaries.length + ' saved beneficiaries** for quick transfers.'
            : '💡 You can add beneficiaries from the Beneficiaries page for faster transfers.'),
        suggestions: generateSuggestions(data, msg),
      };
    }
    if (msg.includes('deposit') || msg.includes('add money')) {
      return {
        message:
          '## 💵 How to Deposit Money\n\n' +
          '1. Go to **"Deposit"** from the sidebar\n' +
          '2. Select the account you want to deposit into\n' +
          '3. Enter the amount and a description\n' +
          '4. Confirm — funds are credited instantly!',
        suggestions: generateSuggestions(data, msg),
      };
    }
    if (msg.includes('withdraw') || msg.includes('cash')) {
      return {
        message:
          '## 🏧 How to Withdraw Money\n\n' +
          '1. Go to **"Withdraw"** from the sidebar\n' +
          '2. Select the account\n' +
          '3. Enter the amount\n' +
          '4. Confirm — make sure you have sufficient balance!\n\n' +
          '⚠️ Check your balance first if you\'re unsure.',
        suggestions: generateSuggestions(data, msg),
      };
    }
    if (msg.includes('kyc') || msg.includes('verif') || msg.includes('document')) {
      return {
        message:
          '## 📋 KYC Verification\n\n' +
          'KYC is identity verification required by banks. Submit via:\n\n' +
          '1. Go to **"KYC Verification"** from the sidebar\n' +
          '2. Select document type (Aadhaar, PAN, Voter ID, etc.)\n' +
          '3. Enter document number and upload a clear image\n' +
          '4. Submit and wait for admin verification (1-2 days)',
        suggestions: generateSuggestions(data, msg),
      };
    }
  }

  // ── 17. THANK YOU / RESPONSES ──
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('thx') || msg.includes('appreciate')) {
    return {
      message:
        'You\'re welcome, **' + data.user.name + '**! 😊\n\n' +
        'Happy to help with your banking needs. Anything else you\'d like to know?\n\n' +
        '💡 Try asking about your balance, recent transactions, or spending patterns!',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── 18. GOODBYE ──
  if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you') || msg.includes('cya') || msg.includes('exit')) {
    const balanceStr = data.accounts.length > 0
      ? '💰 Balance: ' + formatCurrency(data.summary.totalBalance) + '\n'
      : '';
    const transactionsStr = data.transactions.length > 0
      ? '📊 ' + data.transactions.length + ' recent transactions tracked\n'
      : '';
    return {
      message:
        'Goodbye, **' + data.user.name + '**! 👋\n\n' +
        (balanceStr || transactionsStr ? 'Your finances at a glance:\n' + balanceStr + transactionsStr + '\n' : 'Have a great day! 😊\n\n') +
        'Come back anytime you need help!',
      suggestions: generateSuggestions(data, msg),
    };
  }

  // ── FALLBACK: Comprehensive Banking Knowledge Base ──
  // Handles ANY banking-related question with useful information.
  // Priority: 1) Topic-specific info (even with accounts), 2) Full data overview,
  // 3) Account-only overview, 4) Transaction-only, 5) Generic welcome.
  let fallbackResponse = '';

  const fullAccountData = data.accounts.length > 0 && data.transactions.length > 0;
  const hasAccounts = data.accounts.length > 0;
  const hasTransactions = data.transactions.length > 0;

  // ── Detect common banking question topics (checked FIRST so topic questions
  //     show the knowledge base answer even when the user has accounts) ──
  const topics: string[] = [];
  if (/(loan|credit\s*(card|score|limit)|emi|mortgage|borrow)/i.test(msg)) topics.push('loans');
  if (/(savings?\s*(account|plan|goal)|fd|fixed\s*deposit|interest\s*(rate|earning))/i.test(msg)) topics.push('savings');
  if (/(credit\s*(card|score)|debit\s*card|atm|card\s*(block|lost|replace)|cardless)/i.test(msg)) topics.push('cards');
  if (/(upi|neft|rtgs|imps|banking|online\s*banking|mobile\s*banking|net\s*banking)/i.test(msg)) topics.push('digital');
  if (/(security|safe|secure|protect|fraud|scam|phish|hack)/i.test(msg)) topics.push('security');
  if (/(statement|pdf|download|export|print)/i.test(msg)) topics.push('statements');
  if (/(cheque|check\s*book|chequebook|cancel\s*cheque)/i.test(msg)) topics.push('cheque');
  if (/(nominee|nri|tax|pan|aadhaar|link)/i.test(msg)) topics.push('services');
  if (/(charge|fee|penalty|limit|daily|withdrawal\s*limit)/i.test(msg)) topics.push('limits');
  if (/(?:account|open|create|register|new)\b/i.test(msg) && !topics.includes('help')) topics.push('help');
  if (/(hello|hi|hey|help|what\s*can|what\s*do|capabilit|feature)/i.test(msg)) topics.push('help');

  // ── Comprehensive knowledge base answers ──
  const topicAnswers: Record<string, string> = {
    'loans':
      '## 🏦 NeoBank Loan Services\n\n' +
      'NeoBank offers a range of loan products to meet your financial needs:\n\n' +
      '**Personal Loans**\n' +
      '• Amount: Up to ₹25,00,000\n' +
      '• Interest: Starting from 10.5% p.a.\n' +
      '• Tenure: 12-60 months\n' +
      '• Minimal documentation, quick approval\n\n' +
      '**Home Loans**\n' +
      '• Amount: Up to ₹5,00,00,000\n' +
      '• Interest: Starting from 8.5% p.a.\n' +
      '• Tenure: Up to 30 years\n' +
      '• For purchase, construction, or renovation\n\n' +
      '**Auto Loans**\n' +
      '• Amount: Up to 90% of vehicle value\n' +
      '• Interest: Starting from 9.5% p.a.\n' +
      '• Tenure: 12-84 months\n\n' +
      '💡 Visit the **Loans** page to check eligibility and apply online!',
    'savings':
      '## 💰 NeoBank Savings & Deposits\n\n' +
      '**Savings Account**\n' +
      '• Interest Rate: 3.5% p.a.\n' +
      '• No minimum balance requirement\n' +
      '• Free debit card and online banking\n' +
      '• Interest calculated on daily balance, credited quarterly\n\n' +
      '**Fixed Deposits**\n' +
      '• Interest: 5.0% - 7.0% p.a. (varies by tenure)\n' +
      '• Tenure: 7 days to 10 years\n' +
      '• Premature withdrawal allowed (with nominal penalty)\n' +
      '• Loan against FD available up to 90% of amount\n\n' +
      '**Recurring Deposits**\n' +
      '• Monthly deposits starting from ₹500\n' +
      '• Interest: 5.5% p.a.\n' +
      '• Tenure: 6 months to 10 years\n\n' +
      '💡 Open a savings account from **My Accounts** and start earning interest today!',
    'cards':
      '## 💳 NeoBank Card Services\n\n' +
      '**Debit Card**\n' +
      '• Free with every savings/checking account\n' +
      '• Daily withdrawal limit: ₹50,000 (ATM)\n' +
      '• Daily spending limit: ₹1,00,000 (POS/Online)\n' +
      '• Contactless payments supported\n' +
      '• Free replacement if lost/stolen\n\n' +
      '**Credit Card**\n' +
      '• Multiple variants available\n' +
      '• Credit limit based on eligibility\n' +
      '• Rewards points on every transaction\n' +
      '• Fuel surcharge waiver\n' +
      '• Lounge access on premium cards\n\n' +
      '**Lost/Stolen Card?**\n' +
      'Immediately block your card via the app or call our 24/7 helpline.',
    'digital':
      '## 📱 NeoBank Digital Services\n\n' +
      '**UPI Payments**\n' +
      '• Send money instantly using UPI ID\n' +
      '• No account number needed — just scan & pay\n' +
      '• Available through the NeoBank app\n\n' +
      '**NEFT / RTGS / IMPS**\n' +
      '• NEFT: Available 24/7, settles in batches\n' +
      '• RTGS: Real-time settlement, minimum ₹2 lakh\n' +
      '• IMPS: Instant 24/7, any amount\n\n' +
      '**Online Banking**\n' +
      '• View accounts, transactions, statements\n' +
      '• Transfer funds, pay bills, manage beneficiaries\n' +
      '• Download e-statements\n' +
      '• Update profile and manage settings\n\n' +
      '💡 All services are available from the NeoBank sidebar menu!',
    'security':
      '## 🔒 NeoBank Security\n\n' +
      'Your account security is our top priority. Here\'s how we protect you:\n\n' +
      '**Security Features**\n' +
      '• 🔐 Two-factor authentication (2FA)\n' +
      '• 🔑 Biometric login (fingerprint/face)\n' +
      '• 📲 Instant SMS alerts for all transactions\n' +
      '• 🛡️ End-to-end encryption\n\n' +
      '**Safety Tips**\n' +
      '• Never share your password, PIN, or OTP\n' +
      '• NeoBank will never ask for sensitive info via call/email\n' +
      '• Report suspicious activity immediately\n' +
      '• Use strong passwords and change them regularly\n\n' +
      '**In case of fraud**\n' +
      'Call our 24/7 helpline or visit the nearest branch immediately.',
    'statements':
      '## 📄 E-Statements\n\n' +
      'Generate account statements for any period:\n\n' +
      '1️⃣ Go to **"E-Statements"** from the sidebar\n' +
      '2️⃣ Select the account\n' +
      '3️⃣ Choose period: Monthly, Quarterly, or Yearly\n' +
      '4️⃣ Click **Download PDF**\n\n' +
      '📌 Statements include all transactions, fees, and interest earned for the selected period.',
    'cheque':
      '## 📘 Cheque Services\n\n' +
      '**Request a Chequebook**\n' +
      '• Go to **"My Accounts"** and select your account\n' +
      '• Click on "Request Chequebook"\n' +
      '• Delivered to your registered address within 5-7 days\n\n' +
      '**Cancel a Cheque**\n' +
      '• Write "CANCELLED" across the cheque\n' +
      '• Never sign a cancelled cheque\n\n' +
      '💡 Use digital transfers (UPI/NEFT) for faster, safer payments!',
    'services':
      '## 📋 Additional Services\n\n' +
      '**Nominee Registration**\n' +
      'Add or update nominee for your accounts from Profile settings.\n\n' +
      '**NRI Services**\n' +
      'NRE/NRO accounts available for non-resident Indians.\n\n' +
      '**Tax Services**\n' +
      'Download Form 16A and tax certificates from Statements.\n\n' +
      '**Link Aadhaar/PAN**\n' +
      'Link your Aadhaar and PAN from Profile settings to comply with KYC regulations.',
    'limits':
      '## 💳 Daily Transaction Limits\n\n' +
      '**ATM Withdrawal**\n' +
      '• Daily limit: ₹50,000\n' +
      '• Per transaction: ₹10,000\n\n' +
      '**Online Transfer**\n' +
      '• UPI: ₹1,00,000 per day\n' +
      '• NEFT: No limit (subject to daily cap)\n' +
      '• RTGS: No lower limit (min ₹2 lakh for RTGS)\n\n' +
      '**POS / Online Spending**\n' +
      '• Daily limit: ₹1,00,000\n' +
      '• International transactions enabled on request\n\n' +
      '💡 Limits can be customized from Profile → Account Settings.',
    'help':
      '## ✨ What NEO Can Help You With\n\n' +
      'I\'m **NEO**, your AI banking assistant! I can help you with:\n\n' +
      '**💰 Account & Balance**\n' +
      '• "What\'s my total balance?" → See all your accounts\n' +
      '• "Show my savings account" → Specific account details\n\n' +
      '**💸 Transfers & Payments**\n' +
      '• "How to transfer money?" → Step-by-step guide\n' +
      '• "Who are my beneficiaries?" → Your saved payees\n\n' +
      '**📊 Transactions & History**\n' +
      '• "Show my recent transactions" → Latest activity\n' +
      '• "What did I spend on food?" → Category breakdown\n\n' +
      '**🏦 Banking Services**\n' +
      '• Interest rates, KYC, loans, statements, cards\n' +
      '• Security tips, digital banking, limits\n\n' +
      '**Just ask me anything!** Log in to see your personal data.'
  };

  // ── PRIORITY 1: Topic-specific questions get the knowledge base answer ──
  if (topics.length > 0) {
    fallbackResponse = topics.map(t => topicAnswers[t] || '').filter(Boolean).join('\n\n---\n\n');
  }
  // ── PRIORITY 2: Full data (accounts + transactions) → financial overview ──
  else if (fullAccountData) {
    const credits = data.transactions.filter(t => t.type === 'credit');
    const debits = data.transactions.filter(t => t.type === 'debit');
    const transfers = data.transactions.filter(t => t.type === 'transfer');
    let richestAccount = data.accounts[0];
    for (const a of data.accounts) {
      if (a.balance > (richestAccount?.balance || 0)) richestAccount = a;
    }
    const hasSpending = data.transactions.some(t => t.type === 'debit' || t.type === 'transfer');

    fallbackResponse =
      'I\'ll answer based on your data, ' + data.user.name + '!\n\n' +
      'Here\'s what I know about your finances:\n\n' +
      '💰 **Total Balance:** ' + formatCurrency(data.summary.totalBalance) + '\n' +
      '🏦 **Account' + (data.accounts.length > 1 ? 's' : '') + ':** ' +
      data.accounts.map(a => a.type.charAt(0).toUpperCase() + a.type.slice(1) + ' (' + formatCurrency(a.balance, a.currency) + ')').join(', ') + '\n' +
      '🏆 **Largest Account:** ' + richestAccount.type.charAt(0).toUpperCase() + richestAccount.type.slice(1) + ' — ' + formatCurrency(richestAccount.balance, richestAccount.currency) + '\n' +
      '📊 **Activity:** ' + credits.length + ' credits, ' + debits.length + ' debits, ' + transfers.length + ' transfers\n' +
      (hasSpending ? '\n💡 Try asking: "What did I spend on food?" or "Show my income"' : '') +
      '\n\nHow can I help you further? 😊';
  }
  // ── PRIORITY 3: Has accounts but no transactions ──
  else if (hasAccounts) {
    fallbackResponse =
      'Hi **' + data.user.name + '**! 👋\n\n' +
      'Here\'s your account overview:\n\n' +
      '💰 **Total Balance:** ' + formatCurrency(data.summary.totalBalance) + '\n' +
      '🏦 **Accounts:** ' + data.summary.activeAccounts + ' active of ' + data.summary.totalAccounts + '\n\n' +
      'You don\'t have any transactions yet. Make your first deposit or transfer to get started!';
  }
  // ── PRIORITY 4: Has transactions but no accounts ──
  else if (hasTransactions) {
    const creditTxns = data.transactions.filter(t => t.type === 'credit');
    const debitTxns = data.transactions.filter(t => t.type === 'debit');
    fallbackResponse =
      'Hi **' + data.user.name + '**! 👋\n\n' +
      'I can see your recent activity:\n\n' +
      '📊 **Transactions:** ' + data.transactions.length + ' total\n' +
      '⬆️ **Incoming:** ' + creditTxns.length + ' (' + formatCurrency(creditTxns.reduce((s, t) => s + t.amount, 0)) + ')\n' +
      '⬇️ **Outgoing:** ' + debitTxns.length + ' (' + formatCurrency(debitTxns.reduce((s, t) => s + t.amount, 0)) + ')\n\n' +
      'However, no accounts are linked to your profile. You may want to visit **My Accounts** to set one up.';
  }
  // ── PRIORITY 5: No data, no topic — comprehensive welcome guide ──
  else {
    fallbackResponse =
      'Hi **' + data.user.name + '**! 👋 Welcome to NeoBank.\n\n' +
      'You\'re logged in as **' + data.user.email + '** (' + data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1) + ').\n\n' +
      'To get started with NeoBank:\n' +
      '1️⃣ **Open an account** — Visit My Accounts to create a savings or checking account\n' +
      '2️⃣ **Make a deposit** — Add funds to your account\n' +
      '3️⃣ **Transfer money** — Send money to friends and family\n\n' +
      'You can also explore:\n' +
      '🏦 **Loans** — Personal, Home, Auto loans at great rates\n' +
      '💳 **Cards** — Debit and credit card services\n' +
      '📱 **Digital Banking** — UPI, NEFT, RTGS, IMPS\n' +
      '🔒 **Security** — How we protect your money\n\n' +
      'What would you like to know more about? 😊';
  }

  return {
    message: fallbackResponse,
    suggestions: generateSuggestions(data, msg),
  };
}

// ── Public API ─────────────────────────────────────────────

export const aiService = {
  /**
   * Save the Gemini API key to localStorage
   */
  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key);
    initModel(key);
  },

  /**
   * Get the saved API key
   */
  getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },

  /**
   * Check if a valid API key is configured
   */
  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.length > 0;
  },

  /**
   * Send a chat message and get the AI response
   * Always fetches fresh real-time data before responding.
   */
  async sendMessage(
    userMessage: string,
    conversationHistory?: ChatMessage[]
  ): Promise<AIChatResponse> {
    const apiKey = this.getApiKey();

    // Init Gemini if we have a key
    if (apiKey && genAI === null) {
      initModel(apiKey);
    }

    // Build real-time data snapshot (uses same API as My Accounts page)
    const dataSnapshot = await buildDataSnapshot();

    // ── PATH 1: Gemini API is configured — use it with the real data ──
    if (apiKey && model) {
      try {
        const historyText = conversationHistory
          ? buildConversationHistory(conversationHistory)
          : '';

        const systemPrompt = dataSnapshot
          ? buildSystemPrompt(dataSnapshot)
          : 'You are NEO, a banking assistant for NeoBank digital banking platform. Help users with general banking questions and guide them through NeoBank features. Be friendly, professional, and helpful.';

        const fullPrompt = dataSnapshot
          ? `${systemPrompt}\n\n${historyText ? `Conversation:\n${historyText}\n\n` : ''}User Question: ${userMessage}\n\nRespond based on the data provided above.`
          : `${systemPrompt}\n\n${historyText ? `Conversation:\n${historyText}\n\n` : ''}User: ${userMessage}\n\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return { message: text, suggestions: generateSuggestions(dataSnapshot, userMessage) };
      } catch (error: unknown) {
        console.error('[AIService] Gemini API error:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('not found') || errMsg.includes('API key')) {
          localStorage.removeItem(STORAGE_KEY);
          genAI = null;
          model = null;
        }
        // Fall through to the data-driven response below
      }
    }

    // ── PATH 2: User IS logged in — comprehensive data-driven direct responses ──
    if (dataSnapshot) {
      const builtResponse = buildDataResponse(dataSnapshot, userMessage);
      if (builtResponse) {
        return builtResponse;
      }
    }

    // ── PATH 3: No user logged in, no API key ─────────────────
    const msg = userMessage.toLowerCase();

    // Greetings
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening|day))/.test(msg)) {
      return {
        message:
          '👋 Welcome to **NeoBank** — your modern digital banking platform!\n\n' +
          'I\'m **NEO**, your AI banking assistant. I can help you with everything from checking balances to making transfers.\n\n' +
          '💰 **To get started**, just **log in** with your account, and I\'ll be able to answer questions like:\n' +
          '• "What\'s my total balance?"\n' +
          '• "Show my recent transactions"\n' +
          '• "How much did I spend on groceries?"\n' +
          '• "Who are my beneficiaries?"\n\n' +
          'Until then, I can tell you about NeoBank\'s features!',
        suggestions: generateSuggestions(null),
      };
    }

    // Balance info (general)
    if (msg.includes('balance')) {
      return {
        message:
          '## 💰 Checking Your Balance\n\n' +
          'Once you **log in**, I can tell you your exact balance instantly!\n\n' +
          'For example, if you ask "What\'s my total balance?", I\'ll respond with:\n' +
          '> 💰 **Your Total Balance** — ₹32,821.25\n' +
          '> 💼 Savings: ₹24,580.50\n' +
          '> 💳 Checking: ₹8,240.75\n\n' +
          '🔑 **Log in now** and ask me anything about your finances!',
        suggestions: generateSuggestions(null),
      };
    }

    // Transfer info
    if (msg.includes('transfer') || msg.includes('send') || msg.includes('pay')) {
      return {
        message:
          '## 💸 Transferring Money\n\n' +
          'Log in and I can help you with transfers. Here\'s how:\n\n' +
          '1. Go to **"Transfer Funds"** from the sidebar\n' +
          '2. Select your source account\n' +
          '3. Choose a saved beneficiary or enter an account number\n' +
          '4. Enter the amount and description\n' +
          '5. Confirm — processed instantly!\n\n' +
          '💡 You can also ask me "Send ₹1000 to Bob" once you\'re logged in!',
        suggestions: generateSuggestions(null),
      };
    }

    // KYC info
    if (msg.includes('kyc') || msg.includes('verify') || msg.includes('document')) {
      return {
        message:
          '## 📋 KYC Verification\n\n' +
          'KYC (Know Your Customer) is the identity verification process required by banks.\n\n' +
          '**Accepted Documents:** 📇 Aadhaar · 🆔 PAN · 🗳️ Voter ID · 🚗 Driving Licence · 📘 Passport\n\n' +
          '**How to submit:**\n' +
          '1. Go to **"KYC Verification"** from the sidebar\n' +
          '2. Select document type and enter the number\n' +
          '3. Upload a clear image of the document\n' +
          '4. Submit — admin will verify within 1-2 business days',
        suggestions: generateSuggestions(null),
      };
    }

    // Deposit / Withdraw
    if (msg.includes('deposit') || msg.includes('add money')) {
      return {
        message:
          '## 💵 How to Deposit Money\n\n' +
          '1. Go to **"Deposit"** from the sidebar\n' +
          '2. Select the account\n' +
          '3. Enter the amount and optional description\n' +
          '4. Confirm — funds credited immediately!\n\n' +
          '💡 You can also visit a **Teller** for assisted deposits.',
        suggestions: generateSuggestions(null),
      };
    }

    if (msg.includes('withdraw') || msg.includes('withdrawal') || msg.includes('cash')) {
      return {
        message:
          '## 🏧 How to Withdraw Money\n\n' +
          '1. Go to **"Withdraw"** from the sidebar\n' +
          '2. Select the account\n' +
          '3. Enter the amount\n' +
          '4. Confirm — ensure sufficient balance!\n\n' +
          '⚠️ You can only withdraw from accounts with sufficient funds.',
        suggestions: generateSuggestions(null),
      };
    }

    // Account / registration info
    if (msg.includes('create account') || msg.includes('register') || msg.includes('sign up') || msg.includes('open account')) {
      return {
        message:
          '## 🆕 Opening a NeoBank Account\n\n' +
          '1. Click **"Register"** on the login page\n' +
          '2. Enter name, email, phone, and password\n' +
          '3. A **savings account** is auto-created\n' +
          '4. Log in and start banking!\n\n' +
          '💡 Demo credentials: `alice@neobank.com` / `password123`',
        suggestions: generateSuggestions(null),
      };
    }

    // Features / help
    if (msg.includes('feature') || msg.includes('what can') || msg.includes('capabilities') || msg.includes('help')) {
      return {
        message:
          '## ✨ NeoBank Features\n\n' +
          '**👤 Customer** — Dashboard, Transfers, Deposit/Withdraw, Transactions, Beneficiaries, Accounts, E-Statements, KYC, Analytics, Profile, Loans\n' +
          '**🏦 Teller** — Customer search, account creation, deposits/withdrawals\n' +
          '**🛡️ Admin** — User management, account oversight, KYC admin\n\n' +
          'Log in to explore everything!',
        suggestions: generateSuggestions(null),
      };
    }

    // Statements
    if (msg.includes('statement') || msg.includes('pdf')) {
      return {
        message:
          '## 📄 E-Statements\n\n' +
          '1. Go to **"E-Statements"** from the sidebar\n' +
          '2. Choose the account\n' +
          '3. Select period (monthly, quarterly, yearly)\n' +
          '4. Download as PDF\n\n' +
          '📌 Statements include all transactions for the selected period.',
        suggestions: generateSuggestions(null),
      };
    }

    // Loans
    if (msg.includes('loan') || msg.includes('credit') || msg.includes('emi')) {
      return {
        message:
          '## 🏦 Loan Services\n\n' +
          'NeoBank offers:\n' +
          '• **Personal Loans** — For any expenses\n' +
          '• **Home Loans** — For buying/renovating a home\n' +
          '• **Auto Loans** — For purchasing a vehicle\n\n' +
          'Visit the **"Loans"** page to see rates and apply!',
        suggestions: generateSuggestions(null),
      };
    }

    // Beneficiaries info
    if (msg.includes('beneficiar') || msg.includes('payee')) {
      return {
        message:
          '## 👥 Beneficiaries\n\n' +
          'Saved payees for faster transfers:\n\n' +
          '1. Go to **"Beneficiaries"** from the sidebar\n' +
          '2. Click **Add Beneficiary**\n' +
          '3. Enter name, account number, bank, nickname\n' +
          '4. Save — send money instantly!\n\n' +
          'Log in to see your saved beneficiaries!',
        suggestions: generateSuggestions(null),
      };
    }

    // Analytics
    if (msg.includes('analytics') || msg.includes('spend') || msg.includes('budget') || msg.includes('chart')) {
      return {
        message:
          '## 📊 Analytics & Insights\n\n' +
          'The **Analytics** page provides:\n' +
          '• 📈 Monthly Income vs Expenses\n' +
          '• 🏷️ Spending by Category\n' +
          '• 📉 Trends Over Time\n\n' +
          'Log in to view your personal analytics!',
        suggestions: generateSuggestions(null),
      };
    }

    // Total catch-all: General help
    return {
      message:
        '👋 Welcome to **NeoBank**! I\'m **NEO**, your AI banking assistant.\n\n' +
        'Here\'s what you can ask me:\n\n' +
        '💰 **"How do I check my balance?"**\n' +
        '💸 **"How do I transfer money?"**\n' +
        '📋 **"What is KYC?"**\n' +
        '💵 **"How to deposit money?"**\n' +
        '🏧 **"How to withdraw?"**\n' +
        '📊 **"What features are available?"**\n' +
        '🆕 **"How to create an account?"**\n\n' +
        '🔑 **Log in** to get answers based on your actual account data!',
      suggestions: generateSuggestions(null),
    };
  },

  /**
   * Reset the conversation
   */
  resetConversation(): void {
    localStorage.removeItem(HISTORY_KEY);
  },
};

// ── Conversation History Management ────────────────────────

export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    const trimmed = messages.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage might be full
  }
}

export function clearChatHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export default aiService;
