import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import Badge from '../../components/Badge';
import { History, Filter } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions');
      if (res.success) setTransactions(res.transactions);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Transaction Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit record of all debits, credits, rewards, and activation fees processed.
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      {tx.reference}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-purple-400">
                      USER-{tx.user_id}
                    </td>
                    <td className="px-5 py-4 font-medium text-white max-w-sm truncate">
                      {tx.description}
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-slate-300 bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`px-5 py-4 font-bold whitespace-nowrap ${
                      parseFloat(tx.amount) >= 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {parseFloat(tx.amount) >= 0 ? '+' : ''}₦{Math.abs(parseFloat(tx.amount)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
