import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  Bell,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, unreadNotifications } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className={`sticky top-0 z-50 h-[72px] transition-all duration-200 border-b ${
        isScrolled 
          ? 'glass-nav shadow-soft border-border/80' 
          : 'bg-surface/95 backdrop-blur-sm border-border/40'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT: Original EarnFlow Logo */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center text-white shadow-soft shadow-primary/30 group-hover:scale-105 transition-transform">
            {/* Custom geometric logo icon representing flow & reward upward curve */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-dark flex items-center gap-1">
              Earn<span className="text-primary">Flow</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted font-medium -mt-1 hidden sm:inline-block">
              Rewards Platform
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-50 font-semibold'
                    : 'text-muted hover:text-dark hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE: Authentication or User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 text-muted hover:text-dark hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </Link>

              {/* Admin or Dashboard Button */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {/* Profile Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-slate-200 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-dark overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.full_name?.charAt(0).toUpperCase()}</span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-soft-lg border border-border py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-dark truncate">{user.full_name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted" />
                      User Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-muted" />
                      Account Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Backoffice
                      </Link>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-dark hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE: Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="p-2 text-primary bg-primary-50 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-dark rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-border shadow-soft-lg px-4 pt-3 pb-6 animate-slide-up">
          <div className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary-50 font-semibold'
                    : 'text-dark hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 bg-slate-50 rounded-xl mb-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-dark truncate">{user.full_name}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 rounded-xl border border-purple-200"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm font-semibold text-dark bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft shadow-primary/20 transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
