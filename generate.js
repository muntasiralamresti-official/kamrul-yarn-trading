const fs = require('fs');
const path = require('path');

const pages = [
  // Sales
  { name: 'SalesReturn', title: 'Sale Return' },
  { name: 'SalesRecord', title: 'Sales Record' },
  { name: 'Stock', title: 'Stock / Inventory' },
  { name: 'QuotationEntry', title: 'Quotation Entry' },
  { name: 'SalesInvoice', title: 'Sales Invoice' },
  { name: 'ReturnRecord', title: 'Return Record' },
  { name: 'CustomerDue', title: 'Customer Due' },
  { name: 'CustomerLedger', title: 'Customer Ledger' },
  { name: 'CustomerList', title: 'Customer List' },
  { name: 'QuotationInvoice', title: 'Quotation Invoice' },
  { name: 'QuotationRecord', title: 'Quotation Record' },
  { name: 'ProductList', title: 'Product List' },

  // Purchase
  { name: 'PurchaseReturn', title: 'Purchase Return' },
  { name: 'PurchaseRecord', title: 'Purchase Record' },
  { name: 'AssetEntry', title: 'Asset Entry' },
  { name: 'PurchaseInvoicePrint', title: 'Invoice Print' },
  { name: 'PurchaseDueReport', title: 'Due Report' },
  { name: 'PaymentReport', title: 'Payment Report' },
  { name: 'SupplierList', title: 'Supplier List' },
  { name: 'ReOrderList', title: 'Re-Order List' },

  // Accounts
  { name: 'ExpenseEntry', title: 'Expense & Income Entry' },
  { name: 'BankTransactions', title: 'Bank Transactions' },
  { name: 'CustomerPayment', title: 'Customer Payment' },
  { name: 'SupplierPayment', title: 'Supplier Payment' },
  { name: 'CashView', title: 'Cash View' },
  { name: 'TransactionAccounts', title: 'Transaction Accounts' },
  { name: 'BankAccounts', title: 'Bank Accounts' },
  { name: 'ExpenseReport', title: 'Expense & Income Report' },
  { name: 'BankTransactionReport', title: 'Bank Transaction Report' },
  { name: 'BankLedger', title: 'Bank Ledger' },
  { name: 'CashStatement', title: 'Cash Statement' },
  { name: 'BalanceSheet', title: 'Balance Sheet' }
];

const template = (name, title) => `import React from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ${name} = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded hover:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">${title}</h2>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700">
             <Filter size={16} /> Filter
           </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <input type="text" placeholder="Search records..." className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           <span className="text-sm text-gray-500">Showing 0 records</span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
           <div className="text-center text-gray-400">
              <div className="mb-3 text-4xl">📭</div>
              <p className="text-lg font-medium">No records found for ${title}</p>
              <p className="text-sm">This page layout is ready for backend data integration.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ${name};
`;

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

pages.forEach(p => {
  fs.writeFileSync(path.join(pagesDir, p.name + '.jsx'), template(p.name, p.title));
  console.log('Generated ' + p.name + '.jsx');
});
