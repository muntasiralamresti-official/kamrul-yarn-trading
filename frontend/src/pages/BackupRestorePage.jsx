import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { AccountPage } from '../components/Accounts/AccountsUI';
import { useAdminState } from '../lib/adminStore';
import { useCommerceState, stockForProduct } from '../lib/commerceStore';
import { useAccountsState } from '../lib/accountsStore';
import { useHrState } from '../lib/hrStore';
import { usePersonalState } from '../lib/personalStore';
import { exportMultipleSheets } from '../lib/excelExport';
import { writeRemote } from '../lib/remoteState';

const BackupRestorePage = () => {
  const admin = useAdminState();
  const commerce = useCommerceState();
  const accounts = useAccountsState();
  const hr = useHrState();
  const personal = usePersonalState();

  const [restoreStatus, setRestoreStatus] = useState({ message: '', error: false });
  const [restoring, setRestoring] = useState(false);

  // Full system JSON Backup
  const handleDownloadJsonBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Kamrul Yarn Trading',
      modules: {
        'kamrul-yarn-trading.admin.v1': admin,
        'kamrul-yarn-trading.commerce.v1': commerce,
        'kamrul-yarn-trading.accounts.v1': accounts,
        'kamrul-yarn-trading.hr.v1': hr,
        'kamrul-yarn-trading.personal.v1': personal,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kamrul_yarn_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Full system Excel Workbook export
  const handleExportAllExcel = () => {
    const sheets = {
      Products: admin.products.map((p) => ({
        'Product Code': p.code,
        'Product Name': p.name,
        Category: p.category,
        Unit: p.unit,
        'Purchase Price': p.purchasePrice,
        'Sales Price': p.salesPrice,
        'Current Stock': stockForProduct(p, { admin, commerce }),
      })),
      Customers: admin.customers.map((c) => ({
        Code: c.code,
        Name: c.name,
        Phone: c.phone || '—',
        Email: c.email || '—',
        Area: c.area || '—',
        Address: c.address || '—',
      })),
      Suppliers: admin.suppliers.map((s) => ({
        Code: s.code,
        Name: s.name,
        Phone: s.phone || '—',
        Email: s.email || '—',
        Area: s.area || '—',
        Address: s.address || '—',
      })),
      'Sales Records': commerce.sales.map((s) => ({
        Invoice: s.invoice,
        Date: s.date,
        Customer: s.party,
        Total: s.total,
        Paid: s.paid,
        Due: s.due,
      })),
      'Purchase Records': commerce.purchases.map((p) => ({
        Invoice: p.invoice,
        Date: p.date,
        Supplier: p.party,
        Total: p.total,
        Paid: p.paid,
        Due: p.due,
      })),
    };

    exportMultipleSheets(sheets, 'kamrul_yarn_complete_data');
  };

  // JSON Restore
  const handleFileRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreStatus({ message: '', error: false });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.modules || typeof json.modules !== 'object') {
          throw new Error('Invalid backup file. The "modules" section was not found.');
        }

        const entries = Object.entries(json.modules);
        for (const [key, data] of entries) {
          writeRemote(key, data);
        }

        setRestoreStatus({
          message: 'Backup data successfully restored to database! Reloading system...',
          error: false,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        setRestoreStatus({ message: err.message || 'Failed to read or restore backup file.', error: true });
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AccountPage title="Data Backup & Excel Export">
      <div className="space-y-6">
        {restoreStatus.message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              restoreStatus.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {restoreStatus.error ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="text-sm font-medium">{restoreStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Full System Backup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Full System Backup</h3>
              <p className="text-xs text-slate-500 mb-6">
                Download all records (Sales, Purchases, Accounts, Stock, Customers, HR) into a secure JSON backup file.
              </p>
            </div>
            <button
              onClick={handleDownloadJsonBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download size={16} /> Download JSON Backup
            </button>
          </div>

          {/* Card 2: Excel Export */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Multi-Sheet Excel Export</h3>
              <p className="text-xs text-slate-500 mb-6">
                Export products, customers, suppliers, sales, and purchases as a complete workbook with separate tabs.
              </p>
            </div>
            <button
              onClick={handleExportAllExcel}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <FileSpreadsheet size={16} /> Export to Excel (.xlsx)
            </button>
          </div>

          {/* Card 3: Restore Backup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Restore from Backup</h3>
              <p className="text-xs text-slate-500 mb-6">
                Upload a previously downloaded JSON backup file to restore complete system database records.
              </p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
              <Upload size={16} /> {restoring ? 'Restoring...' : 'Upload & Restore File'}
              <input type="file" accept=".json" onChange={handleFileRestore} disabled={restoring} className="hidden" />
            </label>
          </div>
        </div>

        {/* Security & Guidance Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700 mb-1">💡 Backup & Safety Advice:</p>
          <p>
            It is recommended to download a JSON backup at the end of each business week. Restoring a file will overwrite
            existing records in the MongoDB database with the data contained in the backup file.
          </p>
        </div>
      </div>
    </AccountPage>
  );
};

export default BackupRestorePage;
