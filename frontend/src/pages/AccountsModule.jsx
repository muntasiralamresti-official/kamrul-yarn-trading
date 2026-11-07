import React from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { Briefcase, Building, DollarSign, List, PlusSquare, FileText, CreditCard, UserCheck, Receipt } from 'lucide-react';

const AccountsModule = () => {
  const items = [
    { name: 'Personal Ledger (Dues & Loans)', path: '/accounts/personal-ledger', icon: <UserCheck size={40} strokeWidth={2.5} /> },
    { name: 'Expense & Inc Entry', path: '/accounts/expense-entry', icon: <Briefcase size={40} strokeWidth={2.5} /> },
    { name: 'Bank Transactions', path: '/accounts/bank-transactions', icon: <Building size={40} strokeWidth={2.5} /> },
    { name: 'Customer Payment', path: '/accounts/customer-payment', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Money Receipt Print', path: '/accounts/money-receipt', icon: <Receipt size={40} strokeWidth={2.5} /> },
    { name: 'Supplier Payment', path: '/accounts/supplier-payment', icon: <DollarSign size={40} strokeWidth={2.5} /> },
    { name: 'Cash View', path: '/accounts/cash-view', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Transaction Accounts', path: '/accounts/transaction-accounts', icon: <PlusSquare size={40} strokeWidth={2.5} /> },
    { name: 'Bank Accounts', path: '/accounts/bank-accounts', icon: <Building size={40} strokeWidth={2.5} /> },
    { name: 'Expense & Inc Report', path: '/accounts/expense-report', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Bank Transaction Report', path: '/accounts/bank-transaction-report', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Bank Ledger', path: '/accounts/bank-ledger', icon: <FileText size={40} strokeWidth={2.5} /> },
    { name: 'Cash Statement', path: '/accounts/cash-statement', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Balance Sheet', path: '/accounts/balance-sheet', icon: <CreditCard size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="Accounts Module" items={items} />;
};

export default AccountsModule;
