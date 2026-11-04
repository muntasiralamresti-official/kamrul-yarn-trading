const fs = require('fs');
const path = require('path');

const imports = \`import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
import BankTransactionReport from './pages/BankTransactionReport';
import BankLedger from './pages/BankLedger';
import CashStatement from './pages/CashStatement';
import BalanceSheet from './pages/BalanceSheet';
\`;

const routes = \`
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<SalesModule />} />
          <Route path="sales/entry" element={<SalesEntry />} />
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
          <Route path="purchase/return-record" element={<ReturnRecord />} />
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

          <Route path="reports" element={<ReportsModule />} />
          <Route path="reports/profit-loss" element={<ExpenseReport />} />
          <Route path="reports/cash-view" element={<CashView />} />
          <Route path="reports/purchase-invoice" element={<PurchaseRecord />} />
          <Route path="reports/purchase-record" element={<PurchaseRecord />} />
          <Route path="reports/supplier-due" element={<SupplierPayment />} />
          <Route path="reports/supplier-ledger" element={<SupplierList />} />
          <Route path="reports/supplier-payment" element={<PaymentReport />} />
          <Route path="reports/supplier-list" element={<SupplierList />} />
          <Route path="reports/purchase-return" element={<PurchaseReturn />} />
          <Route path="reports/sales-invoice" element={<SalesInvoice />} />
          <Route path="reports/sales-record" element={<SalesRecord />} />
          <Route path="reports/sale-return" element={<SalesReturn />} />
          <Route path="reports/customer-due" element={<CustomerDue />} />
          <Route path="reports/customer-ledger" element={<CustomerLedger />} />
          <Route path="reports/customer-payment" element={<CustomerPayment />} />
          <Route path="reports/customer-list" element={<CustomerList />} />
          <Route path="reports/quotation-invoice" element={<QuotationInvoice />} />
          <Route path="reports/quotation-record" element={<QuotationRecord />} />
          <Route path="reports/stock" element={<Stock />} />
          <Route path="reports/expense-report" element={<ExpenseReport />} />
          <Route path="reports/bank-transaction" element={<BankTransactionReport />} />
          <Route path="reports/bank-ledger" element={<BankLedger />} />
          <Route path="reports/cash-statement" element={<CashStatement />} />
          <Route path="reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="reports/employee-list" element={<CustomerList />} /> 
          <Route path="reports/salary-payment" element={<ExpenseEntry />} />

          {/* Fallback for other modules */}
          <Route path="*" element={<div className="p-8 text-center text-xl text-gray-500">Module Under Construction</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
\`;

fs.writeFileSync(path.join(__dirname, 'frontend', 'src', 'App.jsx'), imports + routes);
console.log('App.jsx updated with all routes');
