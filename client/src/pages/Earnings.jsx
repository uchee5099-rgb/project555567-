import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Wallet, TrendingUp, Clock, CreditCard, Filter, History } from 'lucide-react';

export default function Earnings() {
  const { wallet } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'All') params.append('type', typeFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/wallet/transactions?${params.toString()}`);
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
            Earnings & Financial Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time breakdown of all task rewards, referral bonuses, and bank withdrawals.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Available Balance"
            value={`₦${parseFloat(wallet?.available_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle="Ready for withdrawal"
            icon={Wallet}
          />
          <StatCard
            title="Total Earned"
            value={`₦${parseFloat(wallet?.total_earned || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle="Cumulative gross rewards"
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Rewards"
            value={`₦${parseFloat(wallet?.pending_rewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle="Awaiting moderator review"
            icon={Clock}
          />
          <StatCard
            title="Total Withdrawn"
            value={`₦${parseFloat(wallet?.total_withdrawn || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle="Successfully disbursed"
            icon={CreditCard}
          />
        </div>

        {/* Filter Controls */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-dark">Filter Transactions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-slate-50 font-medium text-dark focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="task_reward">Task Rewards</option>
                <option value="referral_reward">Referral Rewards</option>
                <option value="withdrawal">Withdrawals</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-slate-50 font-medium text-dark focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table & Responsive Mobile Cards */}
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description={typeFilter !== 'All' || statusFilter !== 'All' ? 'No transactions match the selected filters.' : 'Complete available tasks to populate your transaction history.'}
            icon={History}
            actionText={typeFilter !== 'All' || statusFilter !== 'All' ? 'Reset Filters' : 'Browse Tasks'}
            actionLink={typeFilter === 'All' && statusFilter === 'All' ? '/tasks' : null}
            onAction={() => { setTypeFilter('All'); setStatusFilter('All'); }}
          />
        ) : (
          <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-border text-muted uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-muted whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-dark max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-muted">
                        {tx.reference}
                      </td>
                      <td className={`px-6 py-4 font-bold whitespace-nowrap ${
                        parseFloat(tx.amount) >= 0 ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {parseFloat(tx.amount) >= 0 ? '+' : ''}₦{Math.abs(parseFloat(tx.amount)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="sm:hidden divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-dark">{tx.description}</span>
                    <span className={`font-bold text-xs ${
                      parseFloat(tx.amount) >= 0 ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {parseFloat(tx.amount) >= 0 ? '+' : ''}₦{Math.abs(parseFloat(tx.amount)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                    <Badge status={tx.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
