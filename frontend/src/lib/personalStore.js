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
  if (!name) throw new Error('ব্যক্তির নাম প্রদান করুন।');

  const existing = state.persons.find((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== personData.id);
  if (existing) throw new Error('এই নামের ব্যক্তি ইতিমধ্যে যোগ করা আছে।');

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
        relation: String(personData.relation || 'বন্ধু/আত্মীয়').trim(),
        address: String(personData.address || '').trim(),
        openingType: personData.openingType || 'receivable', // receivable (আমি পাবো) | payable (সে পাবে)
        openingAmount: Number(personData.openingAmount) || 0,
        note: String(personData.note || '').trim(),
      },
    ];
  }

  persist({ ...state, persons: nextPersons });
};

export const deletePerson = (personId) => {
  const hasRecords = state.records.some((r) => r.personId === personId);
  if (hasRecords) throw new Error('এই ব্যক্তির লেনদেনের ইতিহাস রয়েছে, তাই ডিলিট করা যাবে না।');
  persist({ ...state, persons: state.persons.filter((p) => p.id !== personId) });
};

export const addPersonalRecord = (data) => {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('টাকার পরিমাণ সঠিক এবং শূন্যের বেশি হতে হবে।');
  if (!data.personId) throw new Error('ব্যক্তি নির্বাচন করুন।');
  if (!data.date) throw new Error('তারিখ আবশ্যক।');

  const person = state.persons.find((p) => p.id === data.personId);
  if (!person) throw new Error('ব্যক্তি খুঁজে পাওয়া যায়নি।');

  const newRecord = {
    id: makeId(),
    personId: data.personId,
    personName: person.name,
    date: data.date,
    type: data.type, // 'given' (আমি দিলাম / ঋণ প্রদান) | 'taken' (আমি নিলাম / ঋণ গ্রহণ) | 'got_back' (ফেরত পেলাম) | 'returned' (ফেরত দিলাম)
    amount,
    method: data.method || 'Cash', // Cash | bKash / Nagad | Bank
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

// ব্যক্তির ব্যালেন্স হিসাব
// ধনাত্মক (+) মানে 'আমি পাবো' (Receivable / তার কাছে পাই)
// ঋণাত্মক (-) মানে 'সে পাবে' (Payable / আমি দেনাদার)
export const calculatePersonBalance = (person, records = state.records) => {
  const initial = person.openingType === 'payable' ? -Number(person.openingAmount || 0) : Number(person.openingAmount || 0);
  const personRecords = records.filter((r) => r.personId === person.id);

  const delta = personRecords.reduce((sum, r) => {
    if (r.type === 'given') return sum + r.amount; // আমি দিলাম -> আমার পাওনা বাড়লো (+)
    if (r.type === 'got_back') return sum - r.amount; // সে ফেরত দিলো -> আমার পাওনা কমলো (-)
    if (r.type === 'taken') return sum - r.amount; // আমি নিলাম -> আমি দেনাদার হলাম (-)
    if (r.type === 'returned') return sum + r.amount; // আমি শোধ দিলাম -> দেনা কমলো (+)
    return sum;
  }, 0);

  return initial + delta;
};
