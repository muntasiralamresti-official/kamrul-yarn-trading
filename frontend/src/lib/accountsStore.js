import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.accounts.v1';
const defaultCategories = [
  { id: 'default-income', name: 'Other Income', type: 'Income' },
  { id: 'default-expense', name: 'General Expense', type: 'Expense' },
];

const initialState = () => ({
  transactions: [],
  bankAccounts: [],
  categories: defaultCategories,
  openingCash: 0,
});

const parseStoredState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  const value = JSON.parse(raw);
  if (
    !value ||
    !Array.isArray(value.transactions) ||
    !Array.isArray(value.bankAccounts) ||
    !Array.isArray(value.categories) ||
    !Number.isFinite(value.openingCash)
  ) {
    throw new Error('Saved Accounts data is invalid. Clear this browser’s Accounts data to continue.');
  }
  return value;
};

let state = parseStoredState();
const listeners = new Set();

const persist = (next) => {
  writeRemote(STORAGE_KEY, next);
  state = next;
  listeners.forEach((listener) => listener());
};

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => state;

export const useAccountsState = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const accountCategories = (type) => state.categories.filter((category) => category.type === type);

export const addAccountTransaction = (transaction) => {
  const amount = Number(transaction.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero.');
  if (!transaction.date || !transaction.type) throw new Error('Date and transaction type are required.');
  const nextTransaction = { ...transaction, id: makeId(), amount };
  if (
    nextTransaction.bankAccountId &&
    !state.bankAccounts.some((account) => account.id === nextTransaction.bankAccountId)
  ) {
    throw new Error('Select a valid bank account.');
  }
  if (
    nextTransaction.toBankAccountId &&
    !state.bankAccounts.some((account) => account.id === nextTransaction.toBankAccountId)
  ) {
    throw new Error('Select a valid destination bank account.');
  }
  persist({ ...state, transactions: [nextTransaction, ...state.transactions] });
  return nextTransaction;
};

export const removeAccountTransaction = (id) => {
  persist({ ...state, transactions: state.transactions.filter((transaction) => transaction.id !== id) });
};

export const addBankAccount = (account) => {
  const name = account.name.trim();
  const bankName = account.bankName.trim();
  if (!name || !bankName) throw new Error('Account name and bank name are required.');
  const nextAccount = {
    ...account,
    id: makeId(),
    name,
    bankName,
    openingBalance: Number(account.openingBalance) || 0,
  };
  persist({ ...state, bankAccounts: [nextAccount, ...state.bankAccounts] });
  return nextAccount;
};

export const removeBankAccount = (id) => {
  if (state.transactions.some((transaction) =>
    transaction.bankAccountId === id || transaction.toBankAccountId === id
  )) {
    throw new Error('This bank account has transactions and cannot be deleted.');
  }
  persist({ ...state, bankAccounts: state.bankAccounts.filter((account) => account.id !== id) });
};

export const addTransactionCategory = ({ name, type }) => {
  const normalizedName = name.trim();
  if (!normalizedName || !['Income', 'Expense'].includes(type)) {
    throw new Error('Enter a category name and choose Income or Expense.');
  }
  if (state.categories.some((category) => category.type === type && category.name.toLowerCase() === normalizedName.toLowerCase())) {
    throw new Error('This transaction category already exists.');
  }
  const category = { id: makeId(), name: normalizedName, type };
  persist({ ...state, categories: [...state.categories, category] });
  return category;
};

export const setOpeningCash = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) throw new Error('Opening cash must be a valid non-negative amount.');
  persist({ ...state, openingCash: value });
};

export const transactionDirection = (transaction) => {
  if (transaction.type === 'income' || transaction.type === 'customer-payment') return 1;
  if (transaction.type === 'salary-payment') return -1;
  if (transaction.type === 'expense' || transaction.type === 'supplier-payment') return -1;
  if (transaction.type === 'bank-deposit') return transaction.method === 'Cash' ? -1 : 1;
  if (transaction.type === 'bank-withdrawal') return transaction.method === 'Cash' ? 1 : -1;
  return 0;
};

export const cashTransactionDelta = (transaction) => {
  if (transaction.type === 'bank-transfer') return 0;
  if (transaction.method !== 'Cash') return 0;
  return transactionDirection(transaction) * transaction.amount;
};

export const cashBalance = (transactions = state.transactions) => transactions.reduce((balance, transaction) => {
  return balance + cashTransactionDelta(transaction);
}, state.openingCash);

export const bankBalance = (account, transactions = state.transactions) => transactions.reduce((balance, transaction) => {
  if (transaction.type === 'bank-transfer') {
    if (transaction.bankAccountId === account.id) return balance - transaction.amount;
    if (transaction.toBankAccountId === account.id) return balance + transaction.amount;
    return balance;
  }
  if (transaction.bankAccountId !== account.id) return balance;
  if (transaction.type === 'bank-deposit') return balance + transaction.amount;
  if (transaction.type === 'bank-withdrawal') return balance - transaction.amount;
  if (transaction.type === 'income' && transaction.method === 'Bank') return balance + transaction.amount;
  if (transaction.type === 'expense' && transaction.method === 'Bank') return balance - transaction.amount;
  if (transaction.type === 'customer-payment' && transaction.method === 'Bank') return balance + transaction.amount;
  if (transaction.type === 'supplier-payment' && transaction.method === 'Bank') return balance - transaction.amount;
  if (transaction.type === 'salary-payment' && transaction.method === 'Bank') return balance - transaction.amount;
  return balance;
}, Number(account.openingBalance) || 0);

export const formatMoney = (amount) => `BDT ${Number(amount || 0).toLocaleString('en-BD', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export const localDate = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
