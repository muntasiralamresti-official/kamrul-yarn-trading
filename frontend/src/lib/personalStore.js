import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.personal.v1';

const initialState = () => ({
  persons: [],
  records: [],
});

const parseStoredState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.persons) || !Array.isArray(value.records)) {
      return initialState();
    }
    return value;
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
    nextPersons = state.persons.map((p) => (p.id === personData.id ? { ...p, ...personData, name } : p));
  } else {
    nextPersons = [
      ...state.persons,
      {
        id: makeId(),
        name,
        phone: String(personData.phone || '').trim(),
        relation: String(personData.relation || 'Friend / Family').trim(),
        address: String(personData.address || '').trim(),
        openingType: personData.openingType || 'receivable', // 'receivable' | 'payable'
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
    type: data.type, // 'given' | 'taken' | 'got_back' | 'returned'
    amount,
    method: data.method || 'Cash', // 'Cash' | 'bKash / Nagad' | 'Bank'
    bankOrWalletDetails: String(data.bankOrWalletDetails || '').trim(),
    note: String(data.note || '').trim(),
    createdAt: new Date().toISOString(),
  };

  persist({ ...state, records: [newRecord, ...state.records] });
  return newRecord;
};

export const deletePersonalRecord = (recordId) => {
  persist({ ...state, records: state.records.filter((r) => r.id !== recordId) });
};

// Calculate net balance for a contact
// Positive (+) = Receivable (I will receive)
// Negative (-) = Payable (I have to pay / my debt)
export const calculatePersonBalance = (person, records = state.records) => {
  const initial = person.openingType === 'payable' ? -Number(person.openingAmount || 0) : Number(person.openingAmount || 0);
  const personRecords = records.filter((r) => r.personId === person.id);

  const delta = personRecords.reduce((sum, r) => {
    if (r.type === 'given') return sum + r.amount; // Lent out -> increases receivable (+)
    if (r.type === 'got_back') return sum - r.amount; // Received back -> decreases receivable (-)
    if (r.type === 'taken') return sum - r.amount; // Borrowed -> increases debt (-)
    if (r.type === 'returned') return sum + r.amount; // Repaid debt -> decreases debt (+)
    return sum;
  }, 0);

  return initial + delta;
};
