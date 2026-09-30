import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { 
  Users, 
  CheckSquare, 
  FileCheck2, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/metrics');
      if (res.success) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.warn('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live operational metrics, submission verification queues, and financial audits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Online</span>
            </span>
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Users */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-3xl font-black text-white">{metrics?.totalUsers || 0}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics?.activeUsers || 0} active • {metrics?.pendingActivations || 0} pending ₦1,000 activation
            </p>
          </div>

          {/* Pending Submissions */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Submissions</span>
              <FileCheck2 className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black text-amber-400">{metrics?.pendingSubmissions || 0}</h3>
            <Link to="/admin/submissions" className="text-[11px] text-amber-300/80 hover:underline inline-flex items-center gap-1 mt-1">
              <span>Review evidence queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Pending Withdrawals */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Withdrawals</span>
              <CreditCard className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-3xl font-black text-rose-400">{metrics?.pendingWithdrawals || 0}</h3>
            <Link to="/admin/withdrawals" className="text-[11px] text-rose-300/80 hover:underline inline-flex items-center gap-1 mt-1">
              <span>Process bank settlements</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Available Tasks */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Available Tasks</span>
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-3xl font-black text-white">{metrics?.availableTasks || 0}</h3>
            <Link to="/admin/tasks" className="text-[11px] text-blue-300/80 hover:underline inline-flex items-center gap-1 mt-1">
              <span>Manage task inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Total Rewards Credited */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Rewards Paid</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black text-emerald-400">
              ₦{parseFloat(metrics?.totalRewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Cumulative platform payouts</p>
          </div>

          {/* Total Withdrawn */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Settled Out</span>
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-3xl font-black text-white">
              ₦{parseFloat(metrics?.totalWithdrawn || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Bank disbursements executed</p>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft">
          <h3 className="text-base font-bold text-white mb-4">Immediate Administrative Tasks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/submissions"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-white block">Review Evidence</span>
                <span className="text-xs text-slate-400">Approve or reject user screenshots</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/users"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-white block">User Activations</span>
                <span className="text-xs text-slate-400">Confirm ₦1,000 fee payments</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/withdrawals"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-white block">Payout Approvals</span>
                <span className="text-xs text-slate-400">Settle pending bank transfers</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
