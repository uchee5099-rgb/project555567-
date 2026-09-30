import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ActivationModal from '../components/ActivationModal';
import api from '../services/api';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckSquare, 
  AlertCircle, 
  Sparkles,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, wallet, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activationModalOpen, setActivationModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [tasksRes, txRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/wallet/transactions')
        ]);
        if (tasksRes.success) setTasks(tasksRes.tasks.slice(0, 3));
        if (txRes.success) setTransactions(txRes.transactions.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Member';

  return (
    <DashboardLayout>
      <ActivationModal
        isOpen={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        onSuccess={() => refreshUser()}
      />

      {/* HEADER GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark flex items-center gap-2">
            Welcome back, {firstName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Here's an overview of your account and daily task opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {!user?.is_account_activated ? (
            <button
              onClick={() => setActivationModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 rounded-xl transition-colors shadow-soft"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Activate Account (₦1,000)</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>Withdrawals Active</span>
            </span>
          )}

          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft transition-all"
          >
            <span>Browse Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 CORE LIVE STATISTIC CARDS (Values strictly from DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Available Balance"
          value={`₦${parseFloat(wallet?.available_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          subtitle="Ready for withdrawal"
          icon={Wallet}
        />
        <StatCard
          title="Total Earned"
          value={`₦${parseFloat(wallet?.total_earned || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          subtitle="Lifetime task rewards"
          icon={TrendingUp}
        />
        <StatCard
          title="Pending Rewards"
          value={`₦${parseFloat(wallet?.pending_rewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          subtitle="Awaiting admin approval"
          icon={Clock}
        />
        <StatCard
          title="Referral Rewards"
          value={`₦${parseFloat(wallet?.referral_rewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          subtitle="From your invited friends"
          icon={Users}
        />
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="bg-gradient-to-r from-dark to-slate-800 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-lg relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> High Reward Opportunity
          </span>
          <h3 className="text-xl font-bold text-white">Share Your Referral Link to Earn ₦250 Per Friend</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Invite your network with your unique code <span className="font-mono bg-slate-700/80 px-1.5 py-0.5 rounded text-white font-bold">{user?.referral_code}</span> and receive bonus cash directly into your wallet.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <Link
            to="/referrals"
            className="w-full md:w-auto text-center px-5 py-2.5 text-xs font-bold text-dark bg-white hover:bg-slate-100 rounded-xl shadow-soft transition-colors"
          >
            Invite Friends
          </Link>
          <Link
            to="/withdraw"
            className="w-full md:w-auto text-center px-5 py-2.5 text-xs font-semibold text-white bg-slate-700/80 hover:bg-slate-600 rounded-xl border border-slate-600 transition-colors"
          >
            Withdraw Funds
          </Link>
        </div>
      </div>

      {/* RECOMMENDED TASKS SECTION */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-dark">Available Tasks</h2>
            <p className="text-xs text-muted">Complete these micro-tasks now to boost your rewards</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="cards" count={3} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks currently available"
            description="Fresh tasks are published throughout the day. Please check back shortly."
            actionText="Check Available Tasks"
            actionLink="/tasks"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-dark">Recent Transactions</h2>
            <p className="text-xs text-muted">Latest wallet activities and settlement records</p>
          </div>
          <Link
            to="/earnings"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Complete your first task to see your earnings history appear here."
            actionText="Start a Task"
            actionLink="/tasks"
          />
        ) : (
          <div className="bg-surface rounded-2xl border border-border/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-border text-muted uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-dark max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 font-bold whitespace-nowrap ${
                        parseFloat(tx.amount) >= 0 ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {parseFloat(tx.amount) >= 0 ? '+' : ''}₦{Math.abs(parseFloat(tx.amount)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
