import { useSyncExternalStore } from 'react';
import { readHydrated, writeRemote } from './remoteState';

const STORAGE_KEY = 'kamrul-yarn-trading.commerce.v1';
const collections = ['sales', 'purchases', 'salesReturns', 'purchaseReturns', 'quotations', 'assets'];
const initialState = () => Object.fromEntries(collections.map((collection) => [collection, []]));
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const parseState = () => {
  const raw = readHydrated(STORAGE_KEY);
  if (!raw) return initialState();
  const saved = JSON.parse(raw);
  if (!saved || collections.some((name) => !Array.isArray(saved[name]))) {
    throw new Error('Saved business transaction data is invalid. Clear this browser’s business data to continue.');
  }
  return Object.fromEntries(collections.map((name) => [name, saved[name]]));
};

let state = parseState();
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const notify = () => listeners.forEach((listener) => listener());
const persist = (next) => {
  writeRemote(STORAGE_KEY, next);
  state = next;
  notify();
};

export const useCommerceState = () => useSyncExternalStore(subscribe, () => state, () => state);
export const getCommerceSnapshot = () => state;

export const nextInvoiceNumber = (collection, date = new Date()) => {
  if (!['sales', 'purchases', 'quotations'].includes(collection)) throw new Error('Choose a valid invoice type.');
  const prefix = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const highest = state[collection].reduce((max, item) => {
    const invoice = String(item.invoice || '');
    return invoice.startsWith(prefix) ? Math.max(max, Number(invoice.slice(prefix.length)) || 0) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
};

const normalizedLines = (items, products) => {
  if (!Array.isArray(items) || !items.length) throw new Error('Add at least one product before saving.');
  return items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId || entry.id === item.id);
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    if (!product) throw new Error(`Product "${item.name || 'unknown'}" is no longer available.`);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate < 0) {
      throw new Error('Product quantities must be greater than zero and rates must be non-negative.');
    }
    const lbsPerBag = Number(product.lbsPerBag || item.lbsPerBag) || 0;
    const conesPerBag = Number(product.conesPerBag || item.conesPerBag) || 0;
    const rateType = item.rateType || (lbsPerBag > 0 ? 'per_lb' : 'per_bag');
    const totalWeight = lbsPerBag > 0 ? quantity * lbsPerBag : 0;
    const total = (rateType === 'per_lb' && lbsPerBag > 0) ? (totalWeight * rate) : (quantity * rate);

    return {
      productId: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      yarnCount: product.yarnCount || item.yarnCount || '',
      yarnType: product.yarnType || item.yarnType || '',
      brand: product.brand || item.brand || '',
      lotNo: product.lotNo || item.lotNo || '',
      conesPerBag,
      lbsPerBag,
      rateType,
      totalWeight,
      quantity,
      rate,
      total,
    };
  });
};

export const stockForProduct = (product, { commerce = state, admin } = {}) => {
  const opening = Number(product.openingStock) || 0;
  const purchased = commerce.purchases.flatMap((item) => item.items).filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + line.quantity, 0);
  const sold = commerce.sales.flatMap((item) => item.items).filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + line.quantity, 0);
  const salesReturned = commerce.salesReturns.filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const purchaseReturned = commerce.purchaseReturns.filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const damaged = (admin?.damages || []).filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  return opening + purchased + salesReturned - sold - purchaseReturned - damaged;
};

const totals = ({ items, discount, vat, transport, cash, bank }) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountValue = Number(discount) || 0;
  const vatValue = Number(vat) || 0;
  const transportValue = Number(transport) || 0;
  const cashValue = Number(cash) || 0;
  const bankValue = Number(bank) || 0;
  const total = subtotal - discountValue + vatValue + transportValue;
  if ([discountValue, vatValue, transportValue, cashValue, bankValue].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Discount, VAT, transport, and payment amounts must be valid non-negative values.');
  }
  if (discountValue > subtotal) throw new Error('Discount cannot exceed the subtotal.');
  if (cashValue + bankValue > total) throw new Error('Paid amount cannot exceed the invoice total.');
  return {
    subtotal, discount: discountValue, vat: vatValue, transport: transportValue,
    total, cash: cashValue, bank: bankValue, paid: cashValue + bankValue,
    due: total - cashValue - bankValue,
  };
};

const saveInvoice = (collection, form, products, admin, invoices) => {
  const items = normalizedLines(form.items, products);
  const summary = totals({ ...form, items });
  const invoice = String(form.invoice || '').trim();
  const party = String(form.party || '').trim();
  if (!invoice || !party || !form.date) throw new Error('Invoice number, date, and business partner are required.');
  if (invoices.some((item) => item.invoice.toLowerCase() === invoice.toLowerCase())) {
    throw new Error('This invoice number already exists.');
  }
  if (collection === 'sales') {
    for (const line of items) {
      const product = products.find((item) => item.id === line.productId);
      const available = stockForProduct(product, { admin });
      const inCart = items.filter((item) => item.productId === line.productId).reduce((sum, item) => sum + item.quantity, 0);
      if (inCart > available) throw new Error(`${product.name} has only ${available} ${product.unit} available.`);
    }
  }
  const record = {
    ...summary,
    id: makeId(),
    invoice,
    date: form.date,
    party,
    employee: String(form.employee || '').trim(),
    note: String(form.note || '').trim(),
    items,
  };
  persist({ ...state, [collection]: [record, ...state[collection]] });
  return record;
};

export const saveSale = (form, products, admin) => saveInvoice('sales', form, products, admin, state.sales);
export const savePurchase = (form, products, admin) => saveInvoice('purchases', form, products, admin, state.purchases);

export const saveQuotation = (form, products) => {
  const items = normalizedLines(form.items, products);
  const summary = totals({ ...form, items, cash: 0, bank: 0 });
  const invoice = String(form.invoice || '').trim();
  const customer = String(form.party || '').trim();
  if (!invoice || !customer || !form.date) throw new Error('Quotation number, date, and customer are required.');
  if (state.quotations.some((item) => item.invoice.toLowerCase() === invoice.toLowerCase())) throw new Error('This quotation number already exists.');
  const quotation = { ...summary, id: makeId(), invoice, date: form.date, customer, preparedBy: String(form.preparedBy || '').trim(), note: String(form.note || '').trim(), items, status: 'Open' };
  persist({ ...state, quotations: [quotation, ...state.quotations] });
  return quotation;
};

const saveReturn = (type, form, invoices, products = [], admin) => {
  const invoice = invoices.find((item) => item.id === form.invoiceId);
  const product = invoice?.items.find((item) => item.productId === form.productId);
  const quantity = Number(form.quantity);
  if (!invoice || !product || !form.date || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Select an invoice product, date, and a valid return quantity.');
  }
  const previousReturns = state[type].filter((item) => item.invoiceId === invoice.id && item.productId === product.productId)
    .reduce((sum, item) => sum + item.quantity, 0);
  if (quantity > product.quantity - previousReturns) {
    throw new Error(`Only ${product.quantity - previousReturns} ${product.unit} remain available to return.`);
  }
  if (type === 'purchaseReturns') {
    const inventoryProduct = products.find((item) => item.id === product.productId);
    const available = inventoryProduct ? stockForProduct(inventoryProduct, { admin }) : 0;
    if (quantity > available) throw new Error(`Only ${available} ${product.unit} are currently in stock to return to the supplier.`);
  }
  const record = {
    id: makeId(),
    number: `${type === 'salesReturns' ? 'SR' : 'PR'}-${String(state[type].length + 1).padStart(6, '0')}`,
    invoiceId: invoice.id,
    invoice: invoice.invoice,
    date: form.date,
    party: invoice.party,
    productId: product.productId,
    product: product.name,
    unit: product.unit,
    quantity,
    rate: product.rate,
    amount: (product.rateType === 'per_lb' && (product.lbsPerBag || 0) > 0)
      ? quantity * product.lbsPerBag * product.rate
      : quantity * product.rate,
    reason: String(form.reason || '').trim(),
  };
  persist({ ...state, [type]: [record, ...state[type]] });
  return record;
};

export const saveSalesReturn = (form) => saveReturn('salesReturns', form, state.sales);
export const savePurchaseReturn = (form, products, admin) => saveReturn('purchaseReturns', form, state.purchases, products, admin);

export const saveAsset = (values) => {
  const name = String(values.name || '').trim();
  const amount = Number(values.amount);
  if (!name || !values.date || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Asset name, purchase date, and a positive amount are required.');
  }
  const asset = { ...values, id: makeId(), name, amount, supplier: String(values.supplier || '').trim() };
  persist({ ...state, assets: [asset, ...state.assets] });
  return asset;
};

export const saleDueByCustomer = (customer, accountTransactions = [], customersList = []) => {
  const customerName = typeof customer === 'object' && customer ? customer.name : customer;
  let opening = 0;
  if (typeof customer === 'object' && customer && 'openingBalance' in customer) {
    opening = Number(customer.openingBalance) || 0;
  } else if (Array.isArray(customersList) && customersList.length) {
    const found = customersList.find((c) => c.name === customerName);
    opening = Number(found?.openingBalance) || 0;
  }
  const invoiced = state.sales.filter((item) => item.party === customerName).reduce((sum, item) => sum + item.total, 0);
  const returned = state.salesReturns.filter((item) => item.party === customerName).reduce((sum, item) => sum + item.amount, 0);
  const paidAtInvoice = state.sales.filter((item) => item.party === customerName).reduce((sum, item) => sum + item.paid, 0);
  const receivedLater = accountTransactions.filter((item) =>
    item.type === 'customer-payment' && item.party === customerName && !item.invoicePayment
  ).reduce((sum, item) => sum + item.amount, 0);
  return Math.max(opening + invoiced - returned - paidAtInvoice - receivedLater, 0);
};

export const purchaseDueBySupplier = (supplier, accountTransactions = [], suppliersList = []) => {
  const supplierName = typeof supplier === 'object' && supplier ? supplier.name : supplier;
  let opening = 0;
  if (typeof supplier === 'object' && supplier && 'openingBalance' in supplier) {
    opening = Number(supplier.openingBalance) || 0;
  } else if (Array.isArray(suppliersList) && suppliersList.length) {
    const found = suppliersList.find((s) => s.name === supplierName);
    opening = Number(found?.openingBalance) || 0;
  }
  const invoices = state.purchases.filter((item) => item.party === supplierName);
  const invoiced = invoices.reduce((sum, item) => sum + item.total, 0);
  const returned = state.purchaseReturns.filter((item) => item.party === supplierName).reduce((sum, item) => sum + item.amount, 0);
  const paidAtInvoice = invoices.reduce((sum, item) => sum + item.paid, 0);
  const paidLater = accountTransactions.filter((item) =>
    item.type === 'supplier-payment' && item.party === supplierName && !item.invoicePayment
  ).reduce((sum, item) => sum + item.amount, 0);
  return Math.max(opening + invoiced - returned - paidAtInvoice - paidLater, 0);
};
