import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-dark mb-6">Terms of Service</h1>
        <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft space-y-4 text-sm text-slate-600 leading-relaxed">
          <p><strong>1. Acceptance of Terms:</strong> By registering with EarnFlow, you agree to comply with all guidelines regarding fair task participation and truthful evidence submission.</p>
          <p><strong>2. Account Activation:</strong> A one-time activation fee of ₦1,000 is required to enable withdrawal privileges. This policy exists to deter automated bots and fraudulent multi-accounting.</p>
          <p><strong>3. Anti-Fraud Policy:</strong> Any submission containing manipulated screenshots, false transaction references, or deceitful evidence will be rejected, and the offending user account will be suspended.</p>
          <p><strong>4. Withdrawals:</strong> Approved rewards can be withdrawn once available balance reaches the minimum threshold of ₦1,000. Settlements are made to valid Nigerian bank accounts.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
