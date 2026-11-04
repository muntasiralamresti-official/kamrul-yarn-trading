import React from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { DollarSign, RotateCcw, FileText, List, PlusSquare, File, RefreshCw, CreditCard, Truck } from 'lucide-react';

const SalesModule = () => {
  const items = [
    { name: 'Sales Entry', path: '/sales/entry', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Delivery Challan', path: '/sales/challan', icon: <Truck size={40} strokeWidth={2.5} /> },
    { name: 'Sale Return', path: '/sales/return', icon: <RotateCcw size={40} strokeWidth={2.5} /> },
    { name: 'Sales Record', path: '/sales/record', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Stock', path: '/sales/stock', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Quotation Entry', path: '/sales/quotation', icon: <PlusSquare size={40} strokeWidth={2.5} /> },
    { name: 'Sales Invoice', path: '/sales/invoice', icon: <File size={40} strokeWidth={2.5} /> },
    { name: 'Return Record', path: '/sales/return-record', icon: <RefreshCw size={40} strokeWidth={2.5} /> },
    { name: 'Customer Due', path: '/sales/customer-due', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Customer Ledger', path: '/sales/customer-ledger', icon: <CreditCard size={40} strokeWidth={2.5} /> },
    { name: 'Customer List', path: '/sales/customer-list', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Quotation Invoice', path: '/sales/quotation-invoice', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Quotation Record', path: '/sales/quotation-record', icon: <File size={40} strokeWidth={2.5} /> },
    { name: 'Product List', path: '/sales/product-list', icon: <List size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="Sales Module" items={items} />;
};

export default SalesModule;
