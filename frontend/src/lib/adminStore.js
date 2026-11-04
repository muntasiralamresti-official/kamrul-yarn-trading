import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';
import { getCommerceSnapshot, stockForProduct } from './commerceStore';

const STORAGE_KEY = 'kamrul-yarn-trading.admin.v1';
const collectionNames = ['products', 'damages', 'customers', 'suppliers', 'categories', 'units', 'areas', 'users'];
const initialState = () => ({
  products: [],
  damages: [],
  customers: [],
  suppliers: [],
  categories: [],
  units: [],
  areas: [],
  users: [],
  company: {
    name: 'Kamrul Yarn Trading',
    owner: 'Md. Kamrul Hasan',
    phone: '+880 1711-000000',
    email: 'kamrulyarn@gmail.com',
    address: 'Tanbazar, Narayanganj, Bangladesh',
    website: 'www.kamrulyarn.com',
    taxId: 'BIN-1984729103'
  },
});

const parseState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  const saved = JSON.parse(raw);
  if (!saved || collectionNames.some((name) => !Array.isArray(saved[name])) || !saved.company || typeof saved.company !== 'object') {
    throw new Error('Saved Administration data is invalid. Clear this browser’s Administration data to continue.');
  }
  const mergedCompany = { ...initialState().company, ...saved.company };
  if (!mergedCompany.name) mergedCompany.name = 'Kamrul Yarn Trading';
  return { ...initialState(), ...saved, company: mergedCompany };
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
const getSnapshot = () => state;

export const useAdminState = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const adminCollections = collectionNames;

export const unitUsage = (unit, source = state) => ({
  products: source.products.filter((item) => item.unit === unit.name).length,
  linkedUnits: source.units.filter((item) => item.baseUnit === unit.name).length,
});

// A unit may convert to one base unit (e.g. 1 Bag = 50 Kg). Chains are blocked to keep conversions unambiguous.
const validateUnit = (unit, id) => {
  const previous = id ? state.units.find((item) => item.id === id) : null;
  const factor = Number(unit.factor);
  unit.fullName = unit.fullName || '';
  unit.baseUnit = unit.baseUnit || '';
  if (!unit.baseUnit) {
    unit.factor = 1;
  } else {
    const base = state.units.find((item) => item.name === unit.baseUnit);
    if (!base) throw new Error('Choose a base unit from the saved units.');
    if (base.id === id || unit.baseUnit.toLowerCase() === unit.name.toLowerCase()) throw new Error('A unit cannot be its own base unit.');
    if (base.baseUnit) throw new Error(`${base.name} already converts to ${base.baseUnit}. Choose a base unit without its own conversion.`);
    if (previous && state.units.some((item) => item.baseUnit === previous.name)) {
      throw new Error('Other units convert to this unit, so it cannot have a base unit itself.');
    }
    if (!Number.isFinite(factor) || factor <= 0) throw new Error('Conversion quantity must be greater than zero.');
    unit.factor = factor;
  }
  if (previous && previous.name !== unit.name) {
    const usage = unitUsage(previous);
    if (usage.products || usage.linkedUnits) throw new Error('This unit is used by products or other units, so its short name cannot be changed.');
  }
};

export const saveAdminRecord = (collection, values, id = null) => {
  if (!collectionNames.includes(collection) || collection === 'damages') {
    throw new Error('Choose a valid Administration record type.');
  }
  if (id && !state[collection].some((item) => item.id === id)) throw new Error('The record no longer exists.');
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  );
  if (!normalized.name) throw new Error('Name is required.');
  if (collection === 'units') validateUnit(normalized, id);
  if (['customers', 'suppliers'].includes(collection)) {
    normalized.openingBalance = Number(values.openingBalance) || 0;
  }
  if (id && ['customers', 'suppliers'].includes(collection)) {
    const previousName = state[collection].find((item) => item.id === id)?.name;
    const commerce = getCommerceSnapshot();
    const linkedRecords = collection === 'customers'
      ? [...commerce.sales, ...commerce.quotations].some((item) => item.party === previousName || item.customer === previousName)
      : [...commerce.purchases].some((item) => item.party === previousName);
    if (linkedRecords && normalized.name !== previousName) {
      throw new Error('This name is linked to saved transactions and cannot be changed.');
    }
  }
  if (state[collection].some((item) => item.id !== id && item.name?.toLowerCase() === normalized.name.toLowerCase())) {
    throw new Error('A record with this name already exists.');
  }
  if (collection === 'users' && state.users.some((item) => item.id !== id && item.email?.toLowerCase() === normalized.email?.toLowerCase())) {
    throw new Error('A user with this email already exists.');
  }
  const codePrefix = collection === 'customers' ? 'C' : collection === 'suppliers' ? 'S' : '';
  const nextCode = codePrefix
    ? `${codePrefix}${String(Math.max(0, ...state[collection].map((item) => Number(item.code?.slice(1)) || 0)) + 1).padStart(5, '0')}`
    : undefined;
  const record = { ...normalized, code: id ? state[collection].find((item) => item.id === id).code : nextCode, id: id || makeId() };
  const records = id
    ? state[collection].map((item) => item.id === id ? record : item)
    : [...state[collection], record];
  persist({ ...state, [collection]: records });
  return record;
};

export const saveAdminProduct = (values, id = null) => {
  if (id && !state.products.some((item) => item.id === id)) throw new Error('The product no longer exists.');
  const product = {
    ...values,
    name: String(values.name || '').trim(),
    category: String(values.category || '').trim(),
    unit: String(values.unit || '').trim(),
    yarnCount: String(values.yarnCount || '').trim(),
    yarnType: String(values.yarnType || '').trim(),
    brand: String(values.brand || '').trim(),
    lotNo: String(values.lotNo || '').trim(),
    conesPerBag: Number(values.conesPerBag || 0),
    lbsPerBag: Number(values.lbsPerBag || 0),
    purchasePrice: Number(values.purchasePrice),
    salesPrice: Number(values.salesPrice),
    openingStock: Number(values.openingStock),
    reorderLevel: Number(values.reorderLevel),
  };
  if (!product.name || !product.category || !product.unit) throw new Error('Product name, category, and unit are required.');
  if (!state.categories.some((item) => item.name === product.category) || !state.units.some((item) => item.name === product.unit)) {
    throw new Error('Choose a category and unit from the saved Administration lists.');
  }
  if ([product.purchasePrice, product.salesPrice, product.openingStock, product.reorderLevel].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Prices and stock values must be valid non-negative numbers.');
  }
  const damaged = state.damages.filter((item) => item.productId === id).reduce((total, item) => total + item.quantity, 0);
  if (product.openingStock < damaged) throw new Error(`Opening stock cannot be lower than recorded damage (${damaged}).`);
  if (state.products.some((item) => item.id !== id && item.name.toLowerCase() === product.name.toLowerCase())) {
    throw new Error('A product with this name already exists.');
  }
  const nextCode = `P${String(Math.max(0, ...state.products.map((item) => Number(item.code?.slice(1)) || 0)) + 1).padStart(5, '0')}`;
  const record = { ...product, code: id ? state.products.find((item) => item.id === id).code : nextCode, id: id || makeId() };
  const products = id ? state.products.map((item) => item.id === id ? record : item) : [...state.products, record];
  persist({ ...state, products });
  return record;
};

export const addProductDamage = ({ productId, date, quantity, reason }) => {
  const product = state.products.find((item) => item.id === productId);
  const amount = Number(quantity);
  if (!product || !date || !Number.isFinite(amount) || amount <= 0) throw new Error('Select a product, date, and a quantity greater than zero.');
  const available = stockForProduct(product, { admin: state });
  if (amount > available) throw new Error(`Damage quantity cannot exceed available stock (${available} ${product.unit}).`);
  const damage = { id: makeId(), productId, date, quantity: amount, reason: String(reason || '').trim() };
  persist({ ...state, damages: [damage, ...state.damages] });
  return damage;
};

export const deleteAdminRecord = (collection, id) => {
  if (!collectionNames.includes(collection)) throw new Error('Choose a valid Administration record type.');
  const commerce = getCommerceSnapshot();
  if (collection === 'products' && [
    ...commerce.sales, ...commerce.purchases, ...commerce.quotations,
  ].some((transaction) => transaction.items.some((item) => item.productId === id))) {
    throw new Error('This product has saved transaction history and cannot be deleted.');
  }
  if (collection === 'customers') {
    const name = state.customers.find((item) => item.id === id)?.name;
    if ([...commerce.sales, ...commerce.salesReturns, ...commerce.quotations].some((item) => item.party === name || item.customer === name)) {
      throw new Error('This customer has saved transaction history and cannot be deleted.');
    }
  }
  if (collection === 'suppliers') {
    const name = state.suppliers.find((item) => item.id === id)?.name;
    if ([...commerce.purchases, ...commerce.purchaseReturns].some((item) => item.party === name)) {
      throw new Error('This supplier has saved transaction history and cannot be deleted.');
    }
  }
  if (collection === 'products' && state.damages.some((item) => item.productId === id)) {
    throw new Error('This product has damage records. Delete those records before deleting the product.');
  }
  if (collection === 'units' && state.units.some((item) => item.baseUnit === state.units.find((unit) => unit.id === id)?.name)) {
    throw new Error('Other units convert to this unit. Remove those conversions first.');
  }
  const blockers = {
    categories: ['products', 'category'],
    units: ['products', 'unit'],
    areas: ['customers', 'area', 'suppliers'],
  };
  const blocker = blockers[collection];
  if (blocker) {
    const [firstCollection, field, secondCollection] = blocker;
    const inUse = [...state[firstCollection], ...(secondCollection ? state[secondCollection] : [])]
      .some((item) => item[field] === state[collection].find((record) => record.id === id)?.name);
    if (inUse) throw new Error('This item is in use and cannot be deleted.');
  }
  persist({ ...state, [collection]: state[collection].filter((item) => item.id !== id) });
};

export const saveCompanyProfile = (values) => {
  const company = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value || '').trim()]));
  if (!company.name) throw new Error('Company name is required.');
  persist({ ...state, company });
};
