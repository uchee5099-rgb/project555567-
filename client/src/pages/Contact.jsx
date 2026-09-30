import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Support & Helpdesk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight">
            Get in Touch
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Have questions about task submissions, withdrawals, or partnerships? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">Email Inquiries</h4>
                  <p className="text-xs text-muted">support@earnflow.ng</p>
                  <p className="text-xs text-muted">partners@earnflow.ng</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">Helpline</h4>
                  <p className="text-xs text-muted">+234 (0) 801 234 5678</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Available Mon-Sat, 8am-8pm</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">Office Location</h4>
                  <p className="text-xs text-muted">Victoria Island, Lagos State, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7">
            <div className="bg-surface rounded-3xl p-8 border border-border shadow-soft">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-dark">Message Sent!</h3>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    Thank you for reaching out. Our support team will respond to {email} within 24 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}
                    className="text-xs font-semibold text-primary underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-dark mb-4">Send a Message</h3>
                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or issue..."
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft transition-colors"
                  >
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
