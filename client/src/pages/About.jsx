import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Target, HeartHandshake, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            About EarnFlow
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight">
            Empowering Everyday Earners Through Digital Tasks
          </h1>
          <p className="text-base text-muted leading-relaxed">
            EarnFlow is an original Nigerian online rewards ecosystem bridging consumer brands, market researchers, and active participants through verified micro-task activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark">Our Mission</h3>
            <p className="text-sm text-muted leading-relaxed">
              To provide a transparent, reliable, and accessible platform where everyday smartphone users in Nigeria earn real income by sharing authentic feedback.
            </p>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark">Zero Fraud Policy</h3>
            <p className="text-sm text-muted leading-relaxed">
              Every task submission is verified with genuine proof. We protect advertisers' budgets while ensuring dedicated contributors are compensated promptly.
            </p>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark">Direct Settlements</h3>
            <p className="text-sm text-muted leading-relaxed">
              We settle approved withdrawals directly to Nigerian commercial and microfinance bank accounts with zero hidden deductions.
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-8 sm:p-12 border border-border shadow-soft text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-dark">Join Our Growing Community</h2>
          <p className="text-sm text-muted leading-relaxed">
            Whether you want to earn spare cash during commutes or refer friends for passive bonuses, EarnFlow is built for you.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-soft transition-all"
          >
            Create Your Account Today
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
