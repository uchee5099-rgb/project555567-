import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { CreditCard, CheckCircle2, XCircle, Clock, Loader2, Send, RotateCcw } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/withdrawals');
      if (res.success) setWithdrawals(res.withdrawals);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (withdrawal, status) => {
    const reason = prompt(`Enter administrative note for marking this withdrawal as ${status.toUpperCase()}:`, status === 'completed' ? 'Transfer settled via NIP' : 'Declined bank account');
    if (reason === null) return; // cancelled

    setActionLoading(withdrawal.id);
    setMessage('');
    try {
      const res = await api.put(`/admin/withdrawals/${withdrawal.id}/status`, {
        status,
        adminNote: reason
      });

      if (res.success) {
        setMessage(`Withdrawal marked as ${status.toUpperCase()}. ${status === 'rejected' ? 'Funds refunded to user wallet.' : ''}`);
        fetchWithdrawals();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Settlements</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize or decline user bank payouts. Rejecting a withdrawal automatically refunds the available balance back to the user's wallet.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-xs text-purple-200">
            {message}
          </div>
        )}

        {/* Withdrawals Table */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Destination Bank</th>
                  <th className="px-5 py-3.5">Account Info</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      {w.reference}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{w.user_name || 'User'}</div>
                      <div className="text-[11px] text-slate-400">{w.user_email}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200 whitespace-nowrap">
                      {w.bank_name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white">{w.account_name}</div>
                      <div className="font-mono text-[11px] text-purple-400">{w.account_number}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-white text-sm whitespace-nowrap">
                      ₦{parseFloat(w.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(w.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        w.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : w.status === 'processing'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : w.status === 'rejected'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {w.status}
                      </span>
                      {w.admin_note && (
                        <span className="block text-[10px] text-slate-500 italic mt-0.5 max-w-[140px] truncate">
                          Note: {w.admin_note}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      {w.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(w, 'processing')}
                            disabled={actionLoading === w.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950 text-blue-300 hover:bg-blue-900 border border-blue-800"
                          >
                            Processing
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(w, 'completed')}
                            disabled={actionLoading === w.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-soft"
                          >
                            Complete Payout
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(w, 'rejected')}
                            disabled={actionLoading === w.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800"
                          >
                            Reject & Refund
                          </button>
                        </>
                      )}

                      {w.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(w, 'completed')}
                            disabled={actionLoading === w.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-soft"
                          >
                            Complete Payout
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(w, 'rejected')}
                            disabled={actionLoading === w.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800"
                          >
                            Reject & Refund
                          </button>
                        </>
                      )}

                      {(w.status === 'completed' || w.status === 'rejected') && (
                        <span className="text-[11px] text-slate-500 italic">No further actions</span>
                      )}
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
