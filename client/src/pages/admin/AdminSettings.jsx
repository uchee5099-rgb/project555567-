import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.success) setSettings(res.settings);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/admin/settings', { key, value: settings[key] });
      if (res.success) {
        setMessage(`Setting "${key}" updated successfully.`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Configurations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system-wide parameters, payout thresholds, and activation fees.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-xs text-purple-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft space-y-6">
          {/* Minimum Withdrawal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-white">Minimum Withdrawal Amount (NGN)</label>
              <span className="text-xs text-slate-400">Lowest amount a user can request to withdraw</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.min_withdrawal || '1000.00'}
                onChange={(e) => handleChange('min_withdrawal', e.target.value)}
                className="w-32 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSave('min_withdrawal')}
                disabled={saving}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>

          {/* Activation Fee */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-white">Account Activation Fee (NGN)</label>
              <span className="text-xs text-slate-400">Required one-time fee to unlock withdrawal privileges</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.activation_fee || '1000.00'}
                onChange={(e) => handleChange('activation_fee', e.target.value)}
                className="w-32 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSave('activation_fee')}
                disabled={saving}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>

          {/* Referral Reward */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-white">Referral Bonus Per User (NGN)</label>
              <span className="text-xs text-slate-400">Credited when an invited friend registers and qualifies</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.referral_bonus || '250.00'}
                onChange={(e) => handleChange('referral_bonus', e.target.value)}
                className="w-32 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSave('referral_bonus')}
                disabled={saving}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>

          {/* Support Email */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-semibold text-white">Public Support Email</label>
              <span className="text-xs text-slate-400">Displayed in footer and customer correspondence</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={settings.support_email || 'support@earnflow.ng'}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-48 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSave('support_email')}
                disabled={saving}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Paystack Payment Gateway Integration Card */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-soft space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
                  P
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Paystack Payment Gateway</h2>
                  <p className="text-xs text-slate-400">Receive ₦1,000 account activation fees directly through Paystack</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold rounded-full">
                Gateway Active
              </span>
            </div>
          </div>

          {/* Paystack Public Key */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-white">Paystack Public Key (React JSX)</label>
              <span className="text-xs text-slate-400">Client checkout popup key: <code className="text-emerald-400 font-mono font-bold">{settings.paystack_public_key || 'Not configured'}</code></span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.paystack_public_key || ''}
                onChange={(e) => handleChange('paystack_public_key', e.target.value)}
                placeholder="pk_..."
                className="w-56 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSave('paystack_public_key')}
                disabled={saving}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Update
              </button>
            </div>
          </div>

          {/* Paystack Secret Key (Strictly Node Backend Only) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-semibold text-white">Paystack Secret Key</label>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800 text-amber-300">
                  Node Backend Only
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                Loaded exclusively on Node backend via <code className="text-emerald-400 font-mono">process.env.PAYSTACK_SECRET_KEY</code>. Never exposed to browser.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
                {settings.has_paystack_secret_key ? 'Configured' : 'Not configured'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">Environment only</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
