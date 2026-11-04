import React, { useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { seedHrMasterData } from '../lib/hrStore';
import {
  Banknote,
  BriefcaseBusiness,
  Building,
  FileText,
  UserRoundPlus,
  Users,
  UserRoundX,
} from 'lucide-react';

const HrPayrollModule = () => {
  useEffect(() => {
    seedHrMasterData('designations', ['Manager', 'Sales Executive', 'Accounts Officer', 'Storekeeper', 'Accountant']);
    seedHrMasterData('departments', ['Administration', 'Sales', 'Accounts', 'Purchase', 'Warehouse']);
  }, []);

  const items = [
    { name: 'Salary Payment', path: '/hr/salary-payment', icon: <Banknote size={40} strokeWidth={2.5} /> },
    { name: 'Add Employee', path: '/hr/add-employee', icon: <UserRoundPlus size={40} strokeWidth={2.5} /> },
    { name: 'Employee List', path: '/hr/employee-list', icon: <Users size={40} strokeWidth={2.5} /> },
    { name: 'Inactive List', path: '/hr/inactive-list', icon: <UserRoundX size={40} strokeWidth={2.5} /> },
    { name: 'Add Designation', path: '/hr/add-designation', icon: <BriefcaseBusiness size={40} strokeWidth={2.5} /> },
    { name: 'Add Department', path: '/hr/add-department', icon: <Building size={40} strokeWidth={2.5} /> },
    { name: 'Payment Report', path: '/hr/payment-report', icon: <FileText size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="HR & Payroll Module" items={items} />;
};

export default HrPayrollModule;
