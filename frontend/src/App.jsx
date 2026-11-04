import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import UnitEntryPage from './pages/UnitEntryPage';
import BackupRestorePage from './pages/BackupRestorePage';
import DeliveryChallanPage from './pages/DeliveryChallanPage';
import Dashboard from './pages/Dashboard';
import SalesModule from './pages/SalesModule';
import PurchaseModule from './pages/PurchaseModule';
import AccountsModule from './pages/AccountsModule';
import ReportsModule from './pages/ReportsModule';
import SalesEntry from './pages/SalesEntry';
import PurchaseEntry from './pages/PurchaseEntry';
import SalesReturn from './pages/SalesReturn';
import SalesRecord from './pages/SalesRecord';
import Stock from './pages/Stock';
import QuotationEntry from './pages/QuotationEntry';
import SalesInvoice from './pages/SalesInvoice';
import ReturnRecord from './pages/ReturnRecord';
import CustomerDue from './pages/CustomerDue';
import CustomerLedger from './pages/CustomerLedger';
import CustomerList from './pages/CustomerList';
import QuotationInvoice from './pages/QuotationInvoice';
import QuotationRecord from './pages/QuotationRecord';
import ProductList from './pages/ProductList';
import PurchaseReturn from './pages/PurchaseReturn';
import PurchaseReturnRecord from './pages/PurchaseReturnRecord';
import PurchaseRecord from './pages/PurchaseRecord';
import AssetEntry from './pages/AssetEntry';
import PurchaseInvoicePrint from './pages/PurchaseInvoicePrint';
import PurchaseDueReport from './pages/PurchaseDueReport';
import PaymentReport from './pages/PaymentReport';
import SupplierList from './pages/SupplierList';
import ReOrderList from './pages/ReOrderList';
import ExpenseEntry from './pages/ExpenseEntry';
import BankTransactions from './pages/BankTransactions';
import CustomerPayment from './pages/CustomerPayment';
import SupplierPayment from './pages/SupplierPayment';
import CashView from './pages/CashView';
import TransactionAccounts from './pages/TransactionAccounts';
import BankAccounts from './pages/BankAccounts';
import ExpenseReport from './pages/ExpenseReport';
import RealProfitLossPage from './pages/RealProfitLossPage';
import BankTransactionReport from './pages/BankTransactionReport';
import BankLedger from './pages/BankLedger';
import CashStatement from './pages/CashStatement';
import BalanceSheet from './pages/BalanceSheet';
import MoneyReceiptPrint from './pages/MoneyReceiptPrint';
import PersonalLedgerPage from './pages/PersonalLedgerPage';
import {
  CustomerPaymentReport,
  EmployeeListReport,
  QuotationInvoiceReport,
  SalaryPaymentReport,
  SupplierLedgerReport,
} from './pages/ReportsPages';
import HrPayrollModule from './pages/HrPayrollModule';
import {
  EmployeeEntryPage,
  EmployeeListPage,
  HrMasterEntryPage,
  SalaryPaymentPage,
  SalaryPaymentReportPage,
} from './pages/HrPages';
import AdministrationModule from './pages/AdministrationModule';
import BusinessMonitor from './pages/BusinessMonitor';
import {
  CompanyProfilePage,
  CreateUserPage,
  CustomerEntryPage,
  DamageEntryPage,
  DamageListPage,
  MasterEntryPage,
  ProductEntryPage,
  ProductLedgerPage,
  ProductListPage,
  SupplierEntryPage,
} from './pages/AdminPages';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<SalesModule />} />
          <Route path="sales/entry" element={<SalesEntry />} />
          <Route path="sales/challan" element={<DeliveryChallanPage />} />
          <Route path="sales/return" element={<SalesReturn />} />
          <Route path="sales/record" element={<SalesRecord />} />
          <Route path="sales/stock" element={<Stock />} />
          <Route path="sales/quotation" element={<QuotationEntry />} />
          <Route path="sales/invoice" element={<SalesInvoice />} />
          <Route path="sales/return-record" element={<ReturnRecord />} />
          <Route path="sales/customer-due" element={<CustomerDue />} />
          <Route path="sales/customer-ledger" element={<CustomerLedger />} />
          <Route path="sales/customer-list" element={<CustomerList />} />
          <Route path="sales/quotation-invoice" element={<QuotationInvoice />} />
          <Route path="sales/quotation-record" element={<QuotationRecord />} />
          <Route path="sales/product-list" element={<ProductList />} />

          <Route path="purchase" element={<PurchaseModule />} />
          <Route path="purchase/entry" element={<PurchaseEntry />} />
          <Route path="purchase/return" element={<PurchaseReturn />} />
          <Route path="purchase/record" element={<PurchaseRecord />} />
          <Route path="purchase/asset" element={<AssetEntry />} />
          <Route path="purchase/invoice-print" element={<PurchaseInvoicePrint />} />
          <Route path="purchase/due-report" element={<PurchaseDueReport />} />
          <Route path="purchase/payment-report" element={<PaymentReport />} />
          <Route path="purchase/supplier-list" element={<SupplierList />} />
          <Route path="purchase/return-record" element={<PurchaseReturnRecord />} />
          <Route path="purchase/reorder-list" element={<ReOrderList />} />

          <Route path="accounts" element={<AccountsModule />} />
          <Route path="accounts/expense-entry" element={<ExpenseEntry />} />
          <Route path="accounts/bank-transactions" element={<BankTransactions />} />
          <Route path="accounts/customer-payment" element={<CustomerPayment />} />
          <Route path="accounts/supplier-payment" element={<SupplierPayment />} />
          <Route path="accounts/cash-view" element={<CashView />} />
          <Route path="accounts/transaction-accounts" element={<TransactionAccounts />} />
          <Route path="accounts/bank-accounts" element={<BankAccounts />} />
          <Route path="accounts/expense-report" element={<ExpenseReport />} />
          <Route path="accounts/bank-transaction-report" element={<BankTransactionReport />} />
          <Route path="accounts/bank-ledger" element={<BankLedger />} />
          <Route path="accounts/cash-statement" element={<CashStatement />} />
          <Route path="accounts/balance-sheet" element={<BalanceSheet />} />
          <Route path="accounts/money-receipt" element={<MoneyReceiptPrint />} />
          <Route path="accounts/personal-ledger" element={<PersonalLedgerPage />} />
          <Route path="reports/money-receipt" element={<MoneyReceiptPrint />} />

          <Route path="reports" element={<ReportsModule />} />
          <Route path="hr" element={<HrPayrollModule />} />
          <Route path="hr/salary-payment" element={<SalaryPaymentPage />} />
          <Route path="hr/add-employee" element={<EmployeeEntryPage />} />
          <Route path="hr/employee-list" element={<EmployeeListPage />} />
          <Route path="hr/inactive-list" element={<EmployeeListPage inactiveOnly />} />
          <Route path="hr/add-designation" element={<HrMasterEntryPage collection="designations" title="Add Designation" label="Designation" />} />
          <Route path="hr/add-department" element={<HrMasterEntryPage collection="departments" title="Add Department" label="Department" />} />
          <Route path="hr/payment-report" element={<SalaryPaymentReportPage />} />
          <Route path="admin" element={<AdministrationModule />} />
          <Route path="admin/product-entry" element={<ProductEntryPage />} />
          <Route path="admin/product-list" element={<ProductListPage />} />
          <Route path="admin/product-ledger" element={<ProductLedgerPage />} />
          <Route path="admin/damage-entry" element={<DamageEntryPage />} />
          <Route path="admin/damage-list" element={<DamageListPage />} />
          <Route path="admin/customer-entry" element={<CustomerEntryPage />} />
          <Route path="admin/supplier-entry" element={<SupplierEntryPage />} />
          <Route path="admin/category-entry" element={<MasterEntryPage type="category-entry" />} />
          <Route path="admin/unit-entry" element={<UnitEntryPage />} />
          <Route path="admin/area-entry" element={<MasterEntryPage type="area-entry" />} />
          <Route path="admin/create-user" element={<CreateUserPage />} />
          <Route path="admin/company-profile" element={<CompanyProfilePage />} />
          <Route path="admin/backup" element={<BackupRestorePage />} />
          <Route path="monitor" element={<BusinessMonitor />} />
          <Route path="reports/profit-loss" element={<RealProfitLossPage />} />
          <Route path="reports/expense-report" element={<ExpenseReport />} />
          <Route path="reports/cash-view" element={<CashView />} />
          <Route path="reports/purchase-invoice" element={<PurchaseInvoicePrint />} />
          <Route path="reports/purchase-record" element={<PurchaseRecord />} />
          <Route path="reports/supplier-due" element={<PurchaseDueReport />} />
          <Route path="reports/supplier-ledger" element={<SupplierLedgerReport />} />
          <Route path="reports/supplier-payment" element={<PaymentReport />} />
          <Route path="reports/supplier-list" element={<SupplierList />} />
          <Route path="reports/purchase-return" element={<PurchaseReturnRecord />} />
          <Route path="reports/sales-invoice" element={<SalesInvoice />} />
          <Route path="reports/sales-record" element={<SalesRecord />} />
          <Route path="reports/sale-return" element={<ReturnRecord />} />
          <Route path="reports/customer-due" element={<CustomerDue />} />
          <Route path="reports/customer-ledger" element={<CustomerLedger />} />
          <Route path="reports/customer-payment" element={<CustomerPaymentReport />} />
          <Route path="reports/customer-list" element={<CustomerList />} />
          <Route path="reports/quotation-invoice" element={<QuotationInvoiceReport />} />
          <Route path="reports/quotation-record" element={<QuotationRecord />} />
          <Route path="reports/stock" element={<Stock />} />
          <Route path="reports/expense-report" element={<ExpenseReport />} />
          <Route path="reports/bank-transaction" element={<BankTransactionReport />} />
          <Route path="reports/bank-ledger" element={<BankLedger />} />
          <Route path="reports/cash-statement" element={<CashStatement />} />
          <Route path="reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="reports/employee-list" element={<EmployeeListReport />} />
          <Route path="reports/salary-payment" element={<SalaryPaymentReport />} />

          <Route path="*" element={<div className="mx-auto max-w-xl p-10 text-center"><h1 className="text-2xl font-semibold text-slate-800">Page not found</h1><p className="mt-2 text-slate-500">The address does not match a page in this application.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-sky-700 px-5 py-2 font-medium text-white">Go to dashboard</Link></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
