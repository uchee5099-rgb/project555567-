import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Users, Copy, Check, Gift, Share2, Sparkles, UserCheck } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Error loading referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = data?.referralCode || user?.referral_code || 'EARN2026';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Join me on EarnFlow! Complete simple online tasks and earn real cash. Use my referral link to sign up: ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
            Referrals & Network Rewards
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Invite your network and earn ₦{data?.rewardPerReferral || 250} for each qualified user who joins and completes tasks.
          </p>
        </div>

        {/* 3 Referral Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Total Referrals"
            value={data?.stats?.totalReferrals || 0}
            subtitle="Registered friends"
            icon={Users}
          />
          <StatCard
            title="Successful Referrals"
            value={data?.stats?.successfulReferrals || 0}
            subtitle="Qualified & credited"
            icon={UserCheck}
          />
          <StatCard
            title="Referral Rewards"
            value={`₦${parseFloat(data?.stats?.referralRewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle="Bonus credited to wallet"
            icon={Gift}
          />
        </div>

        {/* Code & Link Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Referral Code */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted font-medium">Your Personal Referral Code</span>
              <div className="my-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between font-mono text-lg sm:text-xl font-black text-dark tracking-wider">
                <span>{referralCode}</span>
                <span className="text-[10px] font-sans font-bold uppercase bg-primary-50 text-primary px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            <button
              onClick={copyCode}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                copiedCode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white shadow-soft'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Referral Code Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Card 2: Referral Link */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted font-medium">Direct Referral Link</span>
              <div className="my-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono text-xs text-slate-600 truncate">
                {referralLink}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                title="Share directly on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Referral History Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">Referral History</h2>
            <span className="text-xs text-muted">Recent invited friends and reward statuses</span>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" count={3} />
          ) : !data?.referralHistory || data.referralHistory.length === 0 ? (
            <EmptyState
              title="No referrals yet"
              description="Share your referral code or link with friends to begin earning rewards here."
              icon={Users}
              actionText="Copy Referral Link"
              onAction={copyLink}
            />
          ) : (
            <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-border text-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Registration Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.referralHistory.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-dark">{ref.referee_name || 'Invited User'}</p>
                          <p className="text-[11px] text-muted">{ref.referee_email}</p>
                        </td>
                        <td className="px-6 py-4 text-muted whitespace-nowrap">
                          {new Date(ref.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={ref.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">
                          ₦{parseFloat(ref.reward_amount || 250).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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
