import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.personal.v1';

export const BUILTIN_TXN_TYPES = [
  { id: 'given', label: '➡️ Lent Money (I gave loan / advance)', impact: 'receivable_plus' },
  { id: 'got_back', label: '⬅️ Recovered Money (They returned my money)', impact: 'receivable_minus' },
  { id: 'taken', label: '⬇️ Borrowed Money (I took loan / credit)', impact: 'payable_plus' },
  { id: 'returned', label: '⬆️ Repaid Debt (I paid back my loan)', impact: 'payable_minus' },
];

const initialState = () => ({
  persons: [],
  records: [],
  customTypes: [],
});

const parseStoredState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.persons) || !Array.isArray(value.records)) {
      return initialState();
    }
    return {
      persons: value.persons || [],
      records: value.records || [],
      customTypes: Array.isArray(value.customTypes) ? value.customTypes : [],
    };
  } catch {
    return initialState();
  }
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

export const usePersonalState = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const savePerson = (personData) => {
  const name = String(personData.name || '').trim();
  if (!name) throw new Error('Please enter the person\'s name.');

  const existing = state.persons.find((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== personData.id);
  if (existing) throw new Error('A person with this name already exists.');

  let nextPersons;
  if (personData.id) {
    nextPersons = state.persons.map((p) => (p.id === personData.id ? {
      ...p,
      name,
      phone: String(personData.phone || '').trim(),
      relation: String(personData.relation || 'Friend / Family').trim(),
      address: String(personData.address || '').trim(),
      openingType: personData.openingType || 'receivable',
      openingAmount: Number(personData.openingAmount) || 0,
      note: String(personData.note || '').trim(),
      updatedAt: new Date().toISOString(),
    } : p));
  } else {
    nextPersons = [
      ...state.persons,
      {
        id: makeId(),
        name,
        phone: String(personData.phone || '').trim(),
        relation: String(personData.relation || 'Friend / Family').trim(),
        address: String(personData.address || '').trim(),
        openingType: personData.openingType || 'receivable',
        openingAmount: Number(personData.openingAmount) || 0,
        note: String(personData.note || '').trim(),
        createdAt: new Date().toISOString(),
      },
    ];
  }

  persist({ ...state, persons: nextPersons });
};

export const deletePerson = (personId) => {
  const hasRecords = state.records.some((r) => r.personId === personId);
  if (hasRecords) {
    throw new Error('This contact has transaction history. Please delete their transactions first.');
  }
  persist({ ...state, persons: state.persons.filter((p) => p.id !== personId) });
};

export const addPersonalRecord = (data) => {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Please enter a valid amount greater than 0.');
  if (!data.personId) throw new Error('Please select a contact person.');
  if (!data.date) throw new Error('Transaction date is required.');

  const person = state.persons.find((p) => p.id === data.personId);
  if (!person) throw new Error('Contact person not found.');

  const newRecord = {
    id: makeId(),
    personId: data.personId,
    personName: person.name,
    date: data.date,
    dueDate: data.dueDate || '',
    type: data.type,
    amount,
    method: data.method || 'Cash',
    bankOrWalletDetails: String(data.bankOrWalletDetails || '').trim(),
    note: String(data.note || '').trim(),
    createdAt: new Date().toISOString(),
  };

  persist({ ...state, records: [newRecord, ...state.records] });
  return newRecord;
};

export const updatePersonalRecord = (recordId, data) => {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Please enter a valid amount greater than 0.');
  if (!data.personId) throw new Error('Please select a contact person.');
  if (!data.date) throw new Error('Transaction date is required.');

  const person = state.persons.find((p) => p.id === data.personId);
  if (!person) throw new Error('Contact person not found.');

  const nextRecords = state.records.map((r) => {
    if (r.id !== recordId) return r;
    return {
      ...r,
      personId: data.personId,
      personName: person.name,
      date: data.date,
      dueDate: data.dueDate || '',
      type: data.type,
      amount,
      method: data.method || 'Cash',
      bankOrWalletDetails: String(data.bankOrWalletDetails || '').trim(),
      note: String(data.note || '').trim(),
      updatedAt: new Date().toISOString(),
    };
  });

  persist({ ...state, records: nextRecords });
};

export const deletePersonalRecord = (recordId) => {
  persist({ ...state, records: state.records.filter((r) => r.id !== recordId) });
};

export const addCustomType = ({ label, impact }) => {
  const trimmed = String(label || '').trim();
  if (!trimmed) throw new Error('Please enter a transaction type name.');

  const id = `custom_${Date.now()}`;
  const newType = {
    id,
    label: trimmed,
    impact: impact || 'receivable_plus',
  };

  persist({
    ...state,
    customTypes: [...(state.customTypes || []), newType],
  });
  return newType;
};

export const deleteCustomType = (typeId) => {
  const inUse = state.records.some((r) => r.type === typeId);
  if (inUse) {
    throw new Error('This transaction type is currently used in existing transactions and cannot be deleted.');
  }
  persist({
    ...state,
    customTypes: (state.customTypes || []).filter((t) => t.id !== typeId),
  });
};

export const calculatePersonBalance = (person, records = state.records, customTypes = state.customTypes || []) => {
  const initial = person.openingType === 'payable' ? -Number(person.openingAmount || 0) : Number(person.openingAmount || 0);
  const personRecords = records.filter((r) => r.personId === person.id);

  const delta = personRecords.reduce((sum, r) => {
    let impact = r.type;
    const custom = customTypes.find((ct) => ct.id === r.type);
    if (custom) impact = custom.impact;

    if (impact === 'given' || impact === 'receivable_plus') return sum + r.amount;
    if (impact === 'got_back' || impact === 'receivable_minus') return sum - r.amount;
    if (impact === 'taken' || impact === 'payable_plus') return sum - r.amount;
    if (impact === 'returned' || impact === 'payable_minus') return sum + r.amount;
    return sum;
  }, 0);

  return initial + delta;
};
