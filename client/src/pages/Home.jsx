import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import { 
  ArrowRight, 
  CheckSquare, 
  Users, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />

      {/* SECTION 1: HERO (70 - 85vh on desktop) */}
      <section className="relative overflow-hidden min-h-[75vh] sm:min-h-[80vh] flex items-center justify-center pt-8 pb-16 lg:py-24">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-100/30 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content (Desktop 7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200/60 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Gateway to Online Rewards</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-dark leading-[1.15]">
                Earn Rewards by Completing <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-2">Simple Tasks</span>
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Complete available tasks, earn rewards, invite friends, and manage your earnings from one simple platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-soft-md shadow-primary/25 hover:shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-dark bg-surface hover:bg-slate-50 border border-border/80 rounded-2xl shadow-soft hover:shadow-soft-md transition-all hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Verified Task Payouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Transparent Transaction Ledger</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Instant Nigerian Bank Direct Settlement</span>
                </div>
              </div>
            </div>

            {/* Right Illustration (Desktop 5 cols) - ORIGINAL Abstract Vector Concept */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating Micro-Card 1: Task Completed */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-surface p-3.5 rounded-2xl shadow-soft-lg border border-border z-20 flex items-center gap-3 animate-pulse-subtle">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block font-medium">Task Completed</span>
                    <span className="text-xs font-bold text-dark">+ ₦450.00 Approved</span>
                  </div>
                </div>

                {/* Floating Micro-Card 2: Wallet Growth */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-surface p-3.5 rounded-2xl shadow-soft-lg border border-border z-20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block font-medium">Wallet Balance</span>
                    <span className="text-xs font-bold text-emerald-600">₦24,850.00 Available</span>
                  </div>
                </div>

                {/* Original Abstract Vector Art representing Digital Rewards, Tasks & Growth */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-slate-700/50 text-white overflow-hidden relative">
                  {/* Decorative mesh background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#16A34A_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Total Rewards Stream</span>
                      <h4 className="text-2xl font-black text-white tracking-tight">₦128,400<span className="text-primary text-lg">.00</span></h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Upward Growth Visual SVG */}
                  <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 relative z-10">
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/50 rounded-t-lg h-16 relative overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 bg-primary/40 h-full rounded-t-lg transition-all" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Mon</span>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/50 rounded-t-lg h-24 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-primary/60 h-full rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Tue</span>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/50 rounded-t-lg h-20 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-primary/50 h-full rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Wed</span>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/50 rounded-t-lg h-32 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-primary/80 h-full rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Thu</span>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/50 rounded-t-lg h-40 relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-primary h-full rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-primary font-bold">Fri</span>
                    </div>
                  </div>

                  {/* Task ticker */}
                  <div className="mt-4 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono text-slate-400">Live Queue: 14 Tasks</span>
                    </div>
                    <span className="text-primary font-bold">₦250 - ₦1,500</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: DEMONSTRATION STATISTIC CARDS */}
      <section className="py-12 bg-surface border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Transparent demo label as requested */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span>Demonstration Statistics • Verified platform metrics update continuously</span>
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Active Users"
              value="10K+"
              subtitle="Engaged Nigerian community"
              icon={Users}
              isDemo={true}
            />
            <StatCard
              title="Rewards Processed"
              value="₦5M+"
              subtitle="Direct bank settlements"
              icon={TrendingUp}
              isDemo={true}
            />
            <StatCard
              title="Available Tasks"
              value="50+"
              subtitle="Daily fresh opportunities"
              icon={CheckSquare}
              isDemo={true}
            />
            <StatCard
              title="Support Desk"
              value="24/7"
              subtitle="Dedicated assistance"
              icon={ShieldCheck}
              isDemo={true}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY CHOOSE EARNFLOW? (4 Cards) */}
      <section className="py-20 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-dark tracking-tight">
              Why Choose EarnFlow?
            </h2>
            <p className="text-base text-muted leading-relaxed">
              Everything you need to complete tasks and manage your rewards in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD 1: Simple Tasks */}
            <div className="bg-surface rounded-2xl p-7 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">Simple Tasks</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Browse available tasks and complete eligible activities from one convenient dashboard.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-primary">
                <span>Surveys, Apps, Social & More</span>
              </div>
            </div>

            {/* CARD 2: Referral Rewards */}
            <div className="bg-surface rounded-2xl p-7 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">Referral Rewards</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Invite friends using your personal referral link and track eligible referral rewards.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-primary">
                <span>Earn bonus on every qualified referral</span>
              </div>
            </div>

            {/* CARD 3: Easy Withdrawals */}
            <div className="bg-surface rounded-2xl p-7 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">Easy Withdrawals</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Request withdrawals when your available balance meets the configured minimum.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-primary">
                <span>Direct payout to all 25+ Nigerian banks</span>
              </div>
            </div>

            {/* CARD 4: Secure Account */}
            <div className="bg-surface rounded-2xl p-7 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">Secure Account</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Your account information is protected using appropriate security practices.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-primary">
                <span>Enterprise encryption & audit verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS (3 Steps with connected line) */}
      <section className="py-20 bg-surface border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-dark tracking-tight">
              How It Works
            </h2>
            <p className="text-base text-muted leading-relaxed">
              Start earning rewards in three straightforward steps.
            </p>
          </div>

          {/* Desktop Connected Horizontal Process / Mobile Vertical Stack */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-primary to-primary-200 -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
              {/* STEP 01 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-surface border-4 border-primary-100 shadow-soft flex items-center justify-center text-primary font-black text-xl relative group hover:border-primary transition-colors">
                  <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-soft">
                    01
                  </span>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-lg font-bold text-dark">Sign Up</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Create your account and complete the required information.
                  </p>
                </div>
              </div>

              {/* STEP 02 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-surface border-4 border-primary-100 shadow-soft flex items-center justify-center text-primary font-black text-xl relative group hover:border-primary transition-colors">
                  <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-soft">
                    02
                  </span>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-lg font-bold text-dark">Complete Tasks</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Browse available tasks and submit completed work.
                  </p>
                </div>
              </div>

              {/* STEP 03 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-surface border-4 border-primary-100 shadow-soft flex items-center justify-center text-primary font-black text-xl relative group hover:border-primary transition-colors">
                  <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-soft">
                    03
                  </span>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-lg font-bold text-dark">Receive Rewards</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Approved rewards are added to your available balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LARGE CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-light-bg to-primary-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-dark to-slate-800 rounded-3xl p-8 sm:p-14 text-white text-center shadow-soft-lg border border-slate-700/60 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Ready to Get Started?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                Create your account and explore available tasks.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-dark bg-white hover:bg-slate-100 rounded-2xl shadow-soft hover:shadow-glow transition-all hover:-translate-y-0.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to="/tasks"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 rounded-2xl transition-all"
                >
                  Explore Tasks First
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
