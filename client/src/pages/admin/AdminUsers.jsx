import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { Search, ShieldCheck, ShieldAlert, UserX, UserCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    setActionLoading(user.id);
    setMessage('');
    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { isActive: !user.is_active });
      if (res.success) {
        setMessage(`User account ${!user.is_active ? 'activated' : 'suspended'}.`);
        fetchUsers();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActivation = async (user) => {
    setActionLoading(user.id);
    setMessage('');
    try {
      const newStatus = !user.is_account_activated;
      const res = await api.put(`/admin/users/${user.id}/activation`, {
        isAccountActivated: newStatus,
        note: newStatus ? 'Manually confirmed ₦1,000 activation fee by admin' : 'Revoked by admin'
      });
      if (res.success) {
        setMessage(`Account withdrawal activation ${newStatus ? 'ENABLED' : 'REVOKED'} for ${user.full_name}.`);
        fetchUsers();
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Search, suspend accounts, and confirm ₦1,000 account activation fee payments to unlock withdrawals.
            </p>
          </div>
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {message && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-xs text-purple-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* User Table */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Balance</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">₦1,000 Activation</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      <div className="text-[10px] text-purple-400 font-mono">Ref: {u.referral_code}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {u.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400 whitespace-nowrap">
                      ₦{parseFloat(u.wallet?.available_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.is_account_activated ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Activated
                          </span>
                          {u.latestActivation?.payment_reference && (
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5 max-w-[130px] truncate" title={u.latestActivation.payment_reference}>
                              Paystack: {u.latestActivation.payment_reference}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Not Activated
                          </span>
                          {u.latestActivation?.payment_reference && (
                            <span className="block text-[10px] text-purple-300 font-mono mt-0.5 max-w-[130px] truncate font-semibold" title={u.latestActivation.payment_reference}>
                              Paystack: {u.latestActivation.payment_reference}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      {/* Confirm/Toggle Account Activation */}
                      <button
                        onClick={() => handleToggleActivation(u)}
                        disabled={actionLoading === u.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.is_account_activated
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-soft'
                        }`}
                        title="Toggle ₦1,000 Activation to enable withdrawals"
                      >
                        {u.is_account_activated ? 'Revoke Activation' : 'Confirm ₦1,000 Activation'}
                      </button>

                      {/* Suspend / Activate User */}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.is_active
                              ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
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
