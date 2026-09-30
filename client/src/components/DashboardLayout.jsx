import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Users,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import ActivationModal from './ActivationModal';

export default function DashboardLayout({ children }) {
  const { user, wallet, unreadNotifications, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Earnings', path: '/earnings', icon: TrendingUp },
    { name: 'Withdraw', path: '/withdraw', icon: CreditCard },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col md:flex-row">
      {/* Activation Modal */}
      <ActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
      />

      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-surface border-b border-border sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="font-bold text-dark text-lg">Earn<span className="text-primary">Flow</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/notifications" className="relative p-2 text-muted hover:text-dark">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 text-dark hover:bg-slate-100 rounded-lg"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col justify-between
        transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-[72px] px-6 flex items-center justify-between border-b border-border">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center text-white shadow-soft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-dark">
                Earn<span className="text-primary">Flow</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden p-1.5 text-muted hover:text-dark"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Quick Info */}
          <div className="p-4 mx-3 my-3 bg-slate-50 border border-border/70 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary font-bold flex items-center justify-center flex-shrink-0 text-sm overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-dark truncate">{user?.full_name}</p>
              <p className="text-[11px] text-muted truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-1">
                {user?.is_account_activated ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    Activated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    Unactivated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-soft shadow-primary/20'
                      : 'text-muted hover:text-dark hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: Activation Promotion or Logout */}
        <div className="p-3 border-t border-border space-y-2">
          {!user?.is_account_activated && (
            <button
              onClick={() => setIsActivationModalOpen(true)}
              className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200 text-xs group hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between font-bold text-emerald-800 mb-1">
                <span>Activate Account</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-emerald-700">Pay ₦1,000 to enable instant withdrawals.</p>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Unactivated Warning Alert if user has not activated account */}
        {user && !user.is_account_activated && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-2.5 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Account Not Activated for Withdrawals:</strong> You can complete tasks, but you need to activate your account (₦1,000 fee) and get admin confirmation to withdraw earnings.
              </span>
            </div>
            <button
              onClick={() => setIsActivationModalOpen(true)}
              className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1 rounded-lg self-start sm:self-auto transition-colors flex-shrink-0"
            >
              Activate Now (₦1,000)
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
