import React, { useState } from 'react';
import { useAdminState, saveCompanyProfile } from '../lib/adminStore';
import { AccountPage, accountInputClass } from '../components/Accounts/AccountsUI';
import { StatusMessage } from './AdminPages';

export const CompanyProfilePage = () => {
  const state = useAdminState();
  const [form, setForm] = useState(state.company);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const save = (event) => {
    event.preventDefault();
    try {
      saveCompanyProfile(form);
      setMessage('Company profile saved.');
      setHasError(false);
    } catch (error) {
      setMessage(error.message);
      setHasError(true);
    }
  };

  return (
    <AccountPage title="Company Profile">
      <form onSubmit={save} className="space-y-4 rounded-lg border border-sky-200 bg-sky-100 p-4">
        <h2 className="rounded bg-sky-700 px-3 py-2 font-semibold text-white">Business Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['name', 'Company Name', true],
            ['owner', 'Owner Name'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['website', 'Website'],
            ['taxId', 'Tax / BIN Number'],
            ['address', 'Business Address'],
          ].map(([name, label, required]) => (
            <label key={name} className={`text-sm text-slate-700 ${name === 'address' ? 'sm:col-span-2' : ''}`}>
              {label}
              <input
                className={`${accountInputClass} mt-1`}
                name={name}
                type={name === 'email' ? 'email' : 'text'}
                value={form[name] || ''}
                onChange={update}
                required={required || false}
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="w-full sm:w-auto rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700">
            Save Company Profile
          </button>
        </div>
      </form>
      <StatusMessage message={message} error={hasError} />
    </AccountPage>
  );
};

export default CompanyProfilePage;
