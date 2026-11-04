import React from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { ShoppingCart, RotateCcw, FileText, TrendingUp, Printer, List, CreditCard, RefreshCw } from 'lucide-react';

const PurchaseModule = () => {
  const items = [
    { name: 'Purchase Entry', path: '/purchase/entry', icon: <ShoppingCart size={40} strokeWidth={2.5} /> },
    { name: 'Purchase Return', path: '/purchase/return', icon: <RotateCcw size={40} strokeWidth={2.5} /> },
    { name: 'Purchase Record', path: '/purchase/record', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Asset Entry', path: '/purchase/asset', icon: <TrendingUp size={40} strokeWidth={2.5} /> },
    { name: 'Invoice Print', path: '/purchase/invoice-print', icon: <Printer size={40} strokeWidth={2.5} /> },
    { name: 'Due Report', path: '/purchase/due-report', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Payment Report', path: '/purchase/payment-report', icon: <CreditCard size={40} strokeWidth={2.5} /> },
    { name: 'Supplier List', path: '/purchase/supplier-list', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Return Record', path: '/purchase/return-record', icon: <RefreshCw size={40} strokeWidth={2.5} /> },
    { name: 'Re-Order List', path: '/purchase/reorder-list', icon: <List size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="Purchase Module" items={items} />;
};

export default PurchaseModule;
