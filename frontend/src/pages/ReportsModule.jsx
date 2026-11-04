import React from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { DollarSign, List, ShoppingCart, CreditCard, Printer, RotateCcw, UserPlus, FileText, File, ShoppingBasket } from 'lucide-react';

const ReportsModule = () => {
  const items = [
    { name: 'Profit & Loss Report', path: '/reports/profit-loss', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Cash View', path: '/reports/cash-view', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Purchase Invoice', path: '/reports/purchase-invoice', icon: <ShoppingCart size={40} strokeWidth={2.5} /> },
    { name: 'Purchase Record', path: '/reports/purchase-record', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Supplier Due Report', path: '/reports/supplier-due', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Supplier Ledger', path: '/reports/supplier-ledger', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Supplier Payment Report', path: '/reports/supplier-payment', icon: <CreditCard size={40} strokeWidth={2.5} /> },
    { name: 'Supplier List', path: '/reports/supplier-list', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Purchase Return List', path: '/reports/purchase-return', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Sales Invoice', path: '/reports/sales-invoice', icon: <Printer size={40} strokeWidth={2.5} /> },
    { name: 'Sales Record', path: '/reports/sales-record', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Sale Return List', path: '/reports/sale-return', icon: <RotateCcw size={40} strokeWidth={2.5} /> },
    { name: 'Customer Due List', path: '/reports/customer-due', icon: <UserPlus size={40} strokeWidth={2.5} /> },
    { name: 'Customer Ledger', path: '/reports/customer-ledger', icon: <UserPlus size={40} strokeWidth={2.5} /> },
    { name: 'Customer Payment Report', path: '/reports/customer-payment', icon: <CreditCard size={40} strokeWidth={2.5} /> },
    { name: 'Customer List', path: '/reports/customer-list', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Quotation Invoice', path: '/reports/quotation-invoice', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Quotation Record', path: '/reports/quotation-record', icon: <File size={40} strokeWidth={2.5} /> },
    { name: 'Stock', path: '/reports/stock', icon: <ShoppingBasket size={40} strokeWidth={2.5} /> },
    { name: 'Expense & Inc Report', path: '/reports/expense-report', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Bank Transaction Report', path: '/reports/bank-transaction', icon: <CreditCard size={40} strokeWidth={2.5} /> },
    { name: 'Bank Ledger', path: '/reports/bank-ledger', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Cash Statement', path: '/reports/cash-statement', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Balance Sheet', path: '/reports/balance-sheet', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Employee List', path: '/reports/employee-list', icon: <UserPlus size={40} strokeWidth={2.5} /> },
    { name: 'Salary Payment Report', path: '/reports/salary-payment', icon: <DollarSign size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="Reports Module" items={items} />;
};

export default ReportsModule;
