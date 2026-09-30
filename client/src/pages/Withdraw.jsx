import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ActivationModal from '../components/ActivationModal';
import api from '../services/api';
import {
  Wallet,
  Building2,
  User,
  Hash,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function Withdraw() {
  const { user, wallet, refreshUser } = useAuth();

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [banks, setBanks] = useState([]);
  const [minWithdrawal, setMinWithdrawal] = useState(1000);
  const [isAccountActivated, setIsAccountActivated] = useState(user?.is_account_activated || false);

  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activationModalOpen, setActivationModalOpen] = useState(false);

  useEffect(() => {
    fetchWalletInfo();
    fetchWithdrawalHistory();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const res = await api.get('/wallet');
      if (res.success) {
        setBanks(res.supportedBanks || []);
        setMinWithdrawal(res.minWithdrawal || 1000);
        setIsAccountActivated(res.isAccountActivated);
      }
    } catch (err) {
      console.warn('Failed to load wallet config:', err);
    }
  };

  const fetchWithdrawalHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/wallet/withdrawals');
      if (res.success) {
        setWithdrawals(res.withdrawals);
      }
    } catch (err) {
      console.warn('Failed to load withdrawal history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const availableBalance = parseFloat(wallet?.available_balance || 0);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // 1. Account Activation Check (CORE USER REQUIREMENT)
    if (!isAccountActivated) {
      setError('account not activated');
      return;
    }

    // 2. Amount Validations
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (numAmount < minWithdrawal) {
      setError(`Amount must meet configured minimum of ₦${minWithdrawal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`);
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Amount cannot exceed your available balance (₦${availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}).`);
      return;
    }

    // 3. Bank Info Validation
    if (!bankName) {
      setError('Please select your destination bank.');
      return;
    }
    if (!accountName.trim()) {
      setError('Account name is required.');
      return;
    }
    if (!/^\d{10}$/.test(accountNumber.trim())) {
      setError('Please enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/wallet/withdraw', {
        amount: numAmount,
        bankName,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim()
      });

      if (res.success) {
        setSuccessMsg('Withdrawal request submitted.');
        setAmount('');
        refreshUser();
        fetchWalletInfo();
        fetchWithdrawalHistory();
      } else {
        // Specifically catch account not activated error
        if (res.error_code === 'ACCOUNT_NOT_ACTIVATED' || res.message === 'account not activated') {
          setError('account not activated');
        } else {
          setError(res.message || 'Failed to submit withdrawal.');
        }
      }
    } catch (err) {
      if (err.data?.error_code === 'ACCOUNT_NOT_ACTIVATED' || err.message === 'account not activated') {
        setError('account not activated');
      } else {
        setError(err.message || 'Server error while submitting withdrawal.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <ActivationModal
        isOpen={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        onSuccess={() => {
          refreshUser();
          fetchWalletInfo();
        }}
      />

      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
            Withdraw Rewards
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Transfer your verified task and referral earnings directly to any Nigerian bank.
          </p>
        </div>

        {/* Balance Overview & Activation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Balance Box */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium">Available Balance</span>
              <h2 className="text-3xl font-extrabold text-dark mt-1">
                ₦{availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-[11px] text-muted block mt-1">
                Minimum Withdrawal: <span className="font-semibold text-dark">₦{minWithdrawal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center">
              <Wallet className="w-7 h-7" />
            </div>
          </div>

          {/* Account Activation Status Box */}
          <div className={`rounded-3xl p-6 border shadow-soft flex flex-col justify-between ${
            isAccountActivated
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Withdrawal Activation</span>
                {isAccountActivated ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> Pending Activation
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {isAccountActivated
                  ? 'Your account is fully activated. You are cleared to submit withdrawal requests at any time.'
                  : 'A one-time ₦1,000 activation fee is required to enable withdrawals. Your activation must be confirmed by admin before withdrawal requests can be submitted.'}
              </p>
            </div>

            {!isAccountActivated && (
              <div className="pt-3">
                <button
                  onClick={() => setActivationModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-soft transition-colors"
                >
                  <span>Activate Account (₦1,000)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
          <div className="border-b border-border pb-4 mb-6">
            <h3 className="text-lg font-bold text-dark">Request Withdrawal</h3>
            <p className="text-xs text-muted mt-0.5">
              Enter your payout amount and verified Nigerian bank credentials.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200/80 rounded-2xl flex items-start gap-3 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Withdrawal Notice:</span>
                <span>{error}</span>
                {error === 'account not activated' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setActivationModalOpen(true)}
                      className="font-bold underline text-red-900 hover:text-red-700"
                    >
                      Click here to pay the ₦1,000 activation fee now →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">{successMsg}</span>
                <span className="text-[11px] text-emerald-700">Status: Pending administrator settlement approval.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1.5">
                Amount (NGN)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-muted pointer-events-none">
                  ₦
                </span>
                <input
                  type="number"
                  step="100"
                  min={minWithdrawal}
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder={`Min ₦${minWithdrawal}`}
                  className="w-full pl-9 pr-24 py-2.5 text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(availableBalance).toString())}
                  className="absolute inset-y-1.5 right-1.5 px-3 text-xs font-bold text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  Max Balance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Bank Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={bankName}
                    onChange={(e) => { setBankName(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none"
                  >
                    <option value="">Select Destination Bank</option>
                    {banks.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Account Number (10 Digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="0123456789"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1.5">
                Account Holder Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => { setAccountName(e.target.value); setError(''); }}
                  placeholder="Enter full account name matching bank record"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Compliance Note */}
            <div className="flex items-start gap-2 text-[11px] text-muted p-3 bg-slate-50 rounded-xl">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Withdrawal requests are processed via Nigerian Inter-Bank Settlement System (NIP). Funds typically reflect within 1-24 hours following administrator verification.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl shadow-soft shadow-primary/20 transition-all"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </span>
              ) : (
                'Request Withdrawal'
              )}
            </button>
          </form>
        </div>

        {/* Withdrawal History Table */}
        <div>
          <h2 className="text-lg font-bold text-dark mb-4">Withdrawal Requests History</h2>

          {loadingHistory ? (
            <div className="bg-surface rounded-2xl p-6 border border-border animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-10 bg-slate-100 rounded w-full"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <EmptyState
              title="No withdrawal requests found"
              description="Your pending and settled withdrawal records will be listed here."
              icon={Wallet}
            />
          ) : (
            <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-border text-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Reference</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Bank & Account</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono text-muted text-[11px]">
                          {w.reference}
                        </td>
                        <td className="px-6 py-4 text-muted whitespace-nowrap">
                          {new Date(w.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-dark">{w.bank_name}</p>
                          <p className="text-[11px] text-muted">{w.account_name} • {w.account_number}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-dark whitespace-nowrap">
                          ₦{parseFloat(w.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={w.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
