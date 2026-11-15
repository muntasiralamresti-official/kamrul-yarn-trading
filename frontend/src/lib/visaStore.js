import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.visa.v1';

export const VISA_STATUSES = [
  { id: 'received', label: 'Passport Received', icon: '📥', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'medical', label: 'Medical Done / Fit', icon: '🩺', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'agency_submitted', label: 'Sent to Agency', icon: '🏢', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'visa_approved', label: 'Visa Approved / Stamped', icon: '✈️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'manpower', label: 'Manpower / BMET Done', icon: '📄', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'delivered', label: 'Flight / Delivered', icon: '🚀', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'cancelled', label: 'Cancelled / Refund', icon: '❌', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const initialState = () => ({
  files: [],
  payments: [],
});

const parseStoredState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.files) || !Array.isArray(value.payments)) {
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

export const useVisaState = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const saveVisaFile = (fileData) => {
  const candidateName = String(fileData.candidateName || '').trim();
  const passportNumber = String(fileData.passportNumber || '').trim().toUpperCase();

  if (!candidateName) throw new Error('Please enter candidate / passenger name.');
  if (!passportNumber) throw new Error('Please enter passport number.');

  const existing = state.files.find(
    (f) => f.passportNumber.toUpperCase() === passportNumber && f.id !== fileData.id
  );
  if (existing) throw new Error(`A file with passport number ${passportNumber} already exists (${existing.candidateName}).`);

  let nextFiles;
  if (fileData.id) {
    nextFiles = state.files.map((f) => (f.id === fileData.id ? {
      ...f,
      ...fileData,
      candidateName,
      passportNumber,
      contractAmount: Number(fileData.contractAmount) || 0,
      agencyCost: Number(fileData.agencyCost) || 0,
      updatedAt: new Date().toISOString(),
    } : f));
  } else {
    nextFiles = [
      ...state.files,
      {
        id: makeId(),
        candidateName,
        passportNumber,
        phone: String(fileData.phone || '').trim(),
        country: String(fileData.country || 'Saudi Arabia').trim(),
        agencyName: String(fileData.agencyName || '').trim(),
        agencyPhone: String(fileData.agencyPhone || '').trim(),
        status: fileData.status || 'received',
        contractAmount: Number(fileData.contractAmount) || 0,
        agencyCost: Number(fileData.agencyCost) || 0,
        documents: fileData.documents || {},
        notes: String(fileData.notes || '').trim(),
        createdAt: new Date().toISOString(),
      },
    ];
  }

  persist({ ...state, files: nextFiles });
};

export const deleteVisaFile = (fileId) => {
  const hasPayments = state.payments.some((p) => p.fileId === fileId);
  if (hasPayments) {
    throw new Error('This file has payment records. Please delete its transactions first.');
  }
  persist({ ...state, files: state.files.filter((f) => f.id !== fileId) });
};

export const addVisaPayment = (paymentData) => {
  const amount = Number(paymentData.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Payment amount must be greater than 0.');
  if (!paymentData.fileId) throw new Error('Please select a passport file.');
  if (!paymentData.date) throw new Error('Payment date is required.');

  const file = state.files.find((f) => f.id === paymentData.fileId);
  if (!file) throw new Error('Visa file not found.');

  const newPayment = {
    id: makeId(),
    fileId: paymentData.fileId,
    candidateName: file.candidateName,
    passportNumber: file.passportNumber,
    agencyName: file.agencyName,
    party: paymentData.party || 'candidate', // 'candidate' | 'agency'
    type: paymentData.type || 'received', // 'received' | 'refund_to_candidate' | 'paid_to_agency' | 'refund_from_agency'
    date: paymentData.date,
    amount,
    method: paymentData.method || 'Cash',
    note: String(paymentData.note || '').trim(),
    receiptNo: String(paymentData.receiptNo || '').trim(),
    createdAt: new Date().toISOString(),
  };

  persist({ ...state, payments: [newPayment, ...state.payments] });
  return newPayment;
};

export const deleteVisaPayment = (paymentId) => {
  persist({ ...state, payments: state.payments.filter((p) => p.id !== paymentId) });
};

export const updateVisaStatus = (fileId, newStatus) => {
  const nextFiles = state.files.map((f) => (f.id === fileId ? {
    ...f,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  } : f));
  persist({ ...state, files: nextFiles });
};

// Calculate exact finances for a single visa file
export const calculateFileFinances = (file, payments = state.payments) => {
  const filePayments = payments.filter((p) => p.fileId === file.id);

  // Money from Candidate
  const candidatePaid = filePayments.reduce((sum, p) => {
    if (p.party === 'candidate' && p.type === 'received') return sum + p.amount;
    if (p.party === 'candidate' && p.type === 'refund_to_candidate') return sum - p.amount;
    return sum;
  }, 0);
  const candidateDue = (file.contractAmount || 0) - candidatePaid;

  // Money to Agency
  const agencyPaid = filePayments.reduce((sum, p) => {
    if (p.party === 'agency' && p.type === 'paid_to_agency') return sum + p.amount;
    if (p.party === 'agency' && p.type === 'refund_from_agency') return sum - p.amount;
    return sum;
  }, 0);
  const agencyDue = (file.agencyCost || 0) - agencyPaid;

  // Net Profit & Cash in Hand
  const projectedProfit = (file.contractAmount || 0) - (file.agencyCost || 0);
  const realizedCashflow = candidatePaid - agencyPaid;

  return {
    candidatePaid,
    candidateDue,
    agencyPaid,
    agencyDue,
    projectedProfit,
    realizedCashflow,
  };
};
