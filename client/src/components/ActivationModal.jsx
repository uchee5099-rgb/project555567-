import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ExternalLink,
  Lock,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Paystack Public Key used directly in React JSX for inline checkout popup
export default function ActivationModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');
  const [error, setError] = useState(null);
  const [isPaystackProcessing, setIsPaystackProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentDetails();
      setPaymentSubmitted(false);
      setSubmittedRef('');
      setError(null);
    }
  }, [isOpen]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const res = await api.post('/activations/initialize');
      if (res.success) {
        setPaymentData(res);
      }
    } catch (err) {
      setError('Could not initialize Paystack payment session.');
    } finally {
      setLoading(false);
    }
  };

  // Launch official Paystack Inline Pop Checkout
  const handlePayWithPaystack = () => {
    const activePublicKey = paymentData?.paystackPublicKey;
    const ref = paymentData?.paymentReference;
    if (!activePublicKey || !ref || !window.PaystackPop?.setup) {
      setError('Secure payment checkout is unavailable. Please refresh and try again.');
      return;
    }

    setError(null);
    setIsPaystackProcessing(true);

    try {
      const handler = window.PaystackPop.setup({
        key: activePublicKey,
        email: user?.email || paymentData.user?.email,
        amount: paymentData.amountKobo,
        currency: 'NGN',
        ref,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: user?.full_name },
            { display_name: 'Purpose', variable_name: 'purpose', value: 'EarnFlow Account Activation Fee' }
          ]
        },
        callback: (response) => {
          setIsPaystackProcessing(false);
          submitPaystackVerification(response.reference || ref);
        },
        onClose: () => setIsPaystackProcessing(false)
      });

      handler.openIframe();
    } catch (err) {
      console.warn('Paystack inline checkout failed to open:', err);
      setIsPaystackProcessing(false);
      setError('Could not open secure payment checkout. Please try again.');
    }
  };

  const submitPaystackVerification = async (reference) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/activations/submit', {
        paymentReference: reference,
        channel: 'paystack',
        paystackResponse: { reference, status: 'success' }
      });

      if (res.success) {
        setSubmittedRef(reference);
        setPaymentSubmitted(true);
        refreshUser();
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Payment submission failed.');
      }
    } catch (err) {
      setError(err.message || 'Error processing Paystack activation payment.');
    } finally {
      setLoading(false);
      setIsPaystackProcessing(false);
    }
  };

  // Quick admin approval shortcut for testers
  const handleAdminInstantApprove = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.put(`/admin/users/${user.id}/activation`, {
        isAccountActivated: true,
        note: 'Instant Paystack verification approved by tester/admin'
      });
      if (res.success) {
        refreshUser();
        onClose();
        alert('Account successfully activated! You can now withdraw.');
      }
    } catch (e) {
      alert('Could not auto-approve: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-border relative overflow-hidden animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-dark hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Paystack Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center shadow-soft">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-dark">Activate Account</h3>
              <p className="text-xs text-muted">Required one-time fee to unlock withdrawals</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Paystack Secure</span>
          </div>
        </div>

        {paymentSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-dark">Paystack Payment Submitted</h4>
              <p className="text-xs text-muted max-w-xs mx-auto mt-1">
                Your ₦1,000 activation payment via Paystack has been recorded.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs font-mono">
              <span className="text-slate-500 text-[11px] block">Paystack Transaction Reference:</span>
              <span className="font-bold text-dark text-xs select-all">{submittedRef}</span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Admin Confirmation Required</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                As configured, the administration reviews and confirms Paystack activation transactions before unlocking withdrawals. Attempting to withdraw before admin confirmation will generate: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-bold">"account not activated"</span>.
              </p>
            </div>

            {/* Quick test approval button for admins/reviewers */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft transition-colors"
              >
                Done / Return to Dashboard
              </button>

              {isAdmin && (
                <button
                  onClick={handleAdminInstantApprove}
                  className="w-full py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
                >
                  ⚡ Admin Shortcut: Instant Confirm Activation
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Fee Banner */}
            <div className="bg-slate-50 border border-border/80 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Activation Fee</span>
                <span className="text-2xl font-black text-dark">₦1,000.00</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-200">
                One-Time Lifetime
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Paystack Channel Features Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-soft mb-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                    P
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Paystack Gateway</span>
                    <span className="text-[10px] text-slate-400">Direct Online Processing</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">₦1,000 NGN</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Debit / Credit Cards (Mastercard, Visa, Verve)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Bank Transfer (Dynamic Paystack Account)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>USSD Codes (*737#, *901#, *966#, *919#)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>OPay, PalmPay, Apple Pay & Bank Direct Debit</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit encrypted banking security standards</span>
              </div>
            </div>

            {/* Paystack Trigger Button */}
            <div className="space-y-3">
              <button
                disabled={loading || isPaystackProcessing}
                onClick={handlePayWithPaystack}
                className="w-full py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl shadow-soft shadow-primary/20 hover:shadow-soft-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading || isPaystackProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Paystack...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₦1,000 via Paystack Gateway</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Sandbox / Instant Demonstration Button */}
              <p className="text-[11px] text-muted text-center leading-relaxed">
                Payment is verified with Paystack before an activation request is recorded.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
