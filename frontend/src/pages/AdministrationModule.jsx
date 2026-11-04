import React from 'react';
import ModuleLayout from '../components/ModuleLayout';
import {
  Building2,
  Globe2,
  List,
  Network,
  Package,
  Plus,
  UserRoundPlus,
  Users,
  Wrench,
  Database,
} from 'lucide-react';

const AdministrationModule = () => {
  const items = [
    { name: 'Product Entry', path: '/admin/product-entry', icon: <Package size={40} strokeWidth={2.5} /> },
    { name: 'Product List', path: '/admin/product-list', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Product Ledger', path: '/admin/product-ledger', icon: <List size={40} strokeWidth={2.5} /> },
    { name: 'Damage Entry', path: '/admin/damage-entry', icon: <Plus size={40} strokeWidth={2.5} /> },
    { name: 'Damage List', path: '/admin/damage-list', icon: <Wrench size={40} strokeWidth={2.5} /> },
    { name: 'Customer Entry', path: '/admin/customer-entry', icon: <UserRoundPlus size={40} strokeWidth={2.5} /> },
    { name: 'Supplier Entry', path: '/admin/supplier-entry', icon: <UserRoundPlus size={40} strokeWidth={2.5} /> },
    { name: 'Category Entry', path: '/admin/category-entry', icon: <Plus size={40} strokeWidth={2.5} /> },
    { name: 'Unit Entry', path: '/admin/unit-entry', icon: <Network size={40} strokeWidth={2.5} /> },
    { name: 'Area Entry', path: '/admin/area-entry', icon: <Globe2 size={40} strokeWidth={2.5} /> },
    { name: 'Create User', path: '/admin/create-user', icon: <Users size={40} strokeWidth={2.5} /> },
    { name: 'Company Profile', path: '/admin/company-profile', icon: <Building2 size={40} strokeWidth={2.5} /> },
    { name: 'Backup & Restore', path: '/admin/backup', icon: <Database size={40} strokeWidth={2.5} /> },
  ];

  return <ModuleLayout title="Administration Module" items={items} />;
};

export default AdministrationModule;
