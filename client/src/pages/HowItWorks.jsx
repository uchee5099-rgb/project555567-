import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle2, UserPlus, FileCheck, Wallet, ArrowRight, HelpCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Sign Up in Seconds',
      description: 'Create your free EarnFlow profile using your name, email, and phone number. No lengthy paperwork.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Pick Available Tasks',
      description: 'Explore surveys, app installations, social media activities, and user feedback prompts matched with reward values.',
      icon: FileCheck,
    },
    {
      step: '03',
      title: 'Submit Evidence & Get Credited',
      description: 'Submit proof of completion (e.g. screenshot or transaction reference). Once approved, rewards are credited directly to your balance.',
      icon: CheckCircle2,
    },
    {
      step: '04',
      title: 'Withdraw to Your Bank',
      description: 'Once your account is activated (one-time ₦1,000 fee) and meets the minimum balance, transfer funds straight to your Nigerian bank.',
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Step-by-Step Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight">
            How EarnFlow Works
          </h1>
          <p className="text-base text-muted leading-relaxed">
            From registration to verified bank payouts, here is the complete journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="bg-surface rounded-3xl p-8 border border-border shadow-soft flex gap-5 group hover:border-primary/40 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Step {s.step}</span>
                  <h3 className="text-lg font-bold text-dark">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Activation Note */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 mb-16 space-y-3">
          <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Why is there a one-time ₦1,000 Account Activation fee?
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed">
            To combat duplicate accounts, bots, and fraudulent spam submissions, EarnFlow requires a one-time lifetime activation fee of ₦1,000 before initiating withdrawals. You can still register and complete tasks freely before activating.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-soft transition-all"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
