import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Phone, Lock, Gift, ArrowRight, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: initialRef
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Field change & inline validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[0-9+]{10,15}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid phone number (e.g. 08012345678).';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setServerError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'Unable to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          
          {/* Registration Card */}
          <div className="bg-surface rounded-3xl p-7 sm:p-9 shadow-soft-lg border border-border">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-2">
                Join EarnFlow and start exploring available rewards.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border ${
                      errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-border'
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* 2. Email Address */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-border'
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              {/* 3. Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border ${
                      errors.phone ? 'border-red-400 bg-red-50/20' : 'border-border'
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* 4. Password */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${
                      errors.password ? 'border-red-400 bg-red-50/20' : 'border-border'
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-dark"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password}</p>
                )}
              </div>

              {/* 5. Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border ${
                      errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-border'
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-dark"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* 6. Referral Code (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-dark">
                    Referral Code
                  </label>
                  <span className="text-[11px] text-muted">Optional</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Gift className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="Enter referral code"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all uppercase"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl shadow-soft shadow-primary/25 hover:shadow-soft-md transition-all active:translate-y-0 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Below Link */}
            <div className="mt-6 text-center text-xs text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
