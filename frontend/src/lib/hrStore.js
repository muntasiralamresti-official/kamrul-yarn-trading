import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.hr.v1';
const collectionNames = ['employees', 'designations', 'departments', 'payments'];
const initialState = () => ({
  employees: [],
  designations: [],
  departments: [],
  payments: [],
  designationSeeded: false,
  departmentSeeded: false,
});

const parseState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  const saved = JSON.parse(raw);
  const initial = initialState();
  if (!saved || collectionNames.some((key) => !Array.isArray(saved[key]))) {
    throw new Error('Saved HR & Payroll data is invalid. Clear this browser’s HR data to continue.');
  }
  return { ...initial, ...saved, designationSeeded: Boolean(saved.designationSeeded), departmentSeeded: Boolean(saved.departmentSeeded) };
};

let state = parseState();
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());
const persist = (next) => {
  writeRemote(STORAGE_KEY, next);
  state = next;
  notify();
};
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useHrState = () => useSyncExternalStore(subscribe, () => state, () => state);

export const seedHrMasterData = (collection, names) => {
  if (!['designations', 'departments'].includes(collection) || !Array.isArray(names)) {
    throw new Error('Choose a valid HR master-data list.');
  }
  const seededKey = collection === 'designations' ? 'designationSeeded' : 'departmentSeeded';
  if (state[seededKey]) return;
  const existing = new Set(state[collection].map((item) => item.name.toLowerCase()));
  const additions = names
    .map((name) => String(name).trim())
    .filter((name) => name && !existing.has(name.toLowerCase()))
    .map((name) => ({ id: makeId(), name }));
  persist({ ...state, [collection]: [...state[collection], ...additions], [seededKey]: true });
};

export const saveHrMaster = (collection, name, id = null) => {
  if (!['designations', 'departments'].includes(collection)) throw new Error('Choose a valid HR master-data list.');
  if (id && !state[collection].some((item) => item.id === id)) throw new Error('The HR record no longer exists.');
  const normalized = String(name || '').trim();
  if (!normalized) throw new Error('Name is required.');
  if (state[collection].some((item) => item.id !== id && item.name.toLowerCase() === normalized.toLowerCase())) {
    throw new Error('This name already exists.');
  }
  const employeeField = collection === 'designations' ? 'designation' : 'department';
  const previous = id ? state[collection].find((item) => item.id === id) : null;
  if (previous && previous.name !== normalized && state.employees.some((employee) => employee[employeeField] === previous.name)) {
    throw new Error('This item is assigned to employees and cannot be renamed.');
  }
  const record = previous ? { ...previous, name: normalized } : { id: makeId(), name: normalized };
  const records = id
    ? state[collection].map((item) => item.id === id ? record : item)
    : [...state[collection], record];
  persist({
    ...state,
    [collection]: records,
    ...(collection === 'designations' ? { designationSeeded: true } : { departmentSeeded: true }),
  });
  return record;
};

export const deleteHrMaster = (collection, id) => {
  if (!['designations', 'departments'].includes(collection)) throw new Error('Choose a valid HR master-data list.');
  const record = state[collection].find((item) => item.id === id);
  if (!record) throw new Error('The HR record no longer exists.');
  const field = collection === 'designations' ? 'designation' : 'department';
  if (state.employees.some((employee) => employee[field] === record.name)) {
    throw new Error('This item is assigned to employees and cannot be deleted.');
  }
  persist({ ...state, [collection]: state[collection].filter((item) => item.id !== id) });
};

export const saveHrEmployee = (values, id = null) => {
  if (id && !state.employees.some((item) => item.id === id)) throw new Error('The employee record no longer exists.');
  const employee = Object.fromEntries(Object.entries(values).map(([key, value]) => [
    key, typeof value === 'string' ? value.trim() : value,
  ]));
  employee.salary = Number(employee.salary);
  if (!employee.name || !employee.phone || !employee.designation || !employee.department || !employee.joinDate) {
    throw new Error('Name, phone, designation, department, and joining date are required.');
  }
  if (!Number.isFinite(employee.salary) || employee.salary < 0) throw new Error('Monthly salary must be a valid non-negative amount.');
  if (!state.designations.some((item) => item.name === employee.designation) || !state.departments.some((item) => item.name === employee.department)) {
    throw new Error('Choose a designation and department from the saved HR lists.');
  }
  if (state.employees.some((item) => item.id !== id && item.phone === employee.phone)) {
    throw new Error('An employee with this phone number already exists.');
  }
  if (employee.email && state.employees.some((item) => item.id !== id && item.email?.toLowerCase() === employee.email.toLowerCase())) {
    throw new Error('An employee with this email already exists.');
  }
  const previous = id ? state.employees.find((item) => item.id === id) : null;
  const code = previous?.code || `E${String(Math.max(0, ...state.employees.map((item) => Number(item.code?.slice(1)) || 0)) + 1).padStart(5, '0')}`;
  const record = { ...previous, ...employee, code, status: previous?.status || 'Active', id: id || makeId() };
  const employees = id
    ? state.employees.map((item) => item.id === id ? record : item)
    : [...state.employees, record];
  persist({ ...state, employees });
  return record;
};

export const setHrEmployeeStatus = (id, status) => {
  if (!['Active', 'Inactive'].includes(status)) throw new Error('Choose a valid employee status.');
  const employee = state.employees.find((item) => item.id === id);
  if (!employee) throw new Error('The employee record no longer exists.');
  persist({ ...state, employees: state.employees.map((item) => item.id === id ? { ...item, status } : item) });
};

export const deleteHrEmployee = (id) => {
  if (state.payments.some((payment) => payment.employeeId === id)) {
    throw new Error('This employee has salary payment history and cannot be deleted. Mark the employee inactive instead.');
  }
  persist({ ...state, employees: state.employees.filter((item) => item.id !== id) });
};

export const addHrPayment = (payment) => {
  const employee = state.employees.find((item) => item.id === payment.employeeId);
  const amount = Number(payment.amount);
  if (!employee || employee.status !== 'Active') throw new Error('Select an active employee.');
  if (!payment.date || !payment.period || !payment.method) throw new Error('Payment date, salary period, and payment method are required.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Salary amount must be greater than zero.');
  if (state.payments.some((item) => item.employeeId === employee.id && item.period === payment.period)) {
    throw new Error('Salary has already been recorded for this employee and period.');
  }
  const record = {
    ...payment,
    id: makeId(),
    receipt: `SAL-${payment.period.replace('-', '')}-${String(state.payments.length + 1).padStart(4, '0')}`,
    employeeId: employee.id,
    employee: employee.name,
    amount,
    method: payment.method,
  };
  persist({ ...state, payments: [record, ...state.payments] });
  return record;
};

export const removeHrPayment = (id) => {
  persist({ ...state, payments: state.payments.filter((payment) => payment.id !== id) });
};
