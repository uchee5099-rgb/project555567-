import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  // Profile Edit Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');

    if (!fullName.trim()) {
      setProfileErr('Full name is required.');
      return;
    }
    if (!phone.trim()) {
      setProfileErr('Phone number is required.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await api.put('/profile/update', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim()
      });

      if (res.success) {
        setProfileMsg('Profile information updated successfully.');
        refreshUser();
      } else {
        setProfileErr(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileErr(err.message || 'Error updating profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErr('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put('/profile/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (res.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordErr(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordErr(err.message || 'Current password incorrect or server error.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
            Account Profile & Security
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your personal contact details, security credentials, and identity verification.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary border-4 border-white shadow-soft flex items-center justify-center font-bold text-2xl overflow-hidden flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-dark">{user?.full_name}</h2>
              {user?.is_account_activated ? (
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Activated
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Unactivated
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{user?.email} • {user?.phone}</p>
            <p className="text-[11px] text-muted font-mono">
              Referral Code: <span className="font-bold text-dark">{user?.referral_code}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form 1: Edit Profile */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
            <h3 className="text-base font-bold text-dark mb-4 pb-2 border-b border-slate-100">
              Personal Information
            </h3>

            {profileMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}
            {profileErr && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{profileErr}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-100/70 text-muted border border-border rounded-xl cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-muted block mt-1">Email cannot be modified directly.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl shadow-soft transition-all"
                >
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
            <h3 className="text-base font-bold text-dark mb-4 pb-2 border-b border-slate-100">
              Security & Password
            </h3>

            {passwordMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}
            {passwordErr && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{passwordErr}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute inset-y-0 left-3 my-auto pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-all"
                >
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
