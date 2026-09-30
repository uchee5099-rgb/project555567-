import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-dark mb-6">Privacy Policy</h1>
        <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft space-y-4 text-sm text-slate-600 leading-relaxed">
          <p><strong>1. Data Collection:</strong> We collect essential information such as full name, email address, phone number, and banking details solely for identity verification, task payout settlements, and fraud prevention.</p>
          <p><strong>2. Information Protection:</strong> Passwords are cryptographically hashed using industry-standard bcrypt algorithms. We never sell, lease, or distribute your personal data to unauthorized third parties.</p>
          <p><strong>3. Task Evidence:</strong> Submitted screenshots and verification details are accessible only to authorized administrators for validation and compliance auditing.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
