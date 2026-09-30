import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/Badge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evidence Form State
  const [isStarted, setIsStarted] = useState(false);
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.success) {
        setTask(res.task);
        if (res.task.userSubmission) {
          setIsStarted(true);
        }
      } else {
        setError(res.message || 'Task not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!evidenceText.trim() && !evidenceUrl.trim()) {
      setSubmitError('Please provide evidence notes, confirmation code, or screenshot URL.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/tasks/${id}/submit`, {
        evidenceText: evidenceText.trim(),
        evidenceUrl: evidenceUrl.trim()
      });

      if (res.success) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        refreshUser();
        fetchTaskDetails();
      } else {
        setSubmitError(res.message || 'Failed to submit evidence.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit task evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const innerContent = (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Available Tasks</span>
      </Link>

      {loading ? (
        <LoadingSkeleton type="cards" count={1} />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h3 className="text-base font-bold">Unable to Load Task</h3>
          <p className="text-xs mt-1">{error}</p>
          <Link to="/tasks" className="inline-block mt-4 text-xs font-bold underline">
            Return to Tasks
          </Link>
        </div>
      ) : task ? (
        <div className="space-y-6">
          {/* Main Task Header Card */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge status={task.category} />
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Time: {task.estimated_time}</span>
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-primary bg-primary-50 px-4 py-1.5 rounded-2xl border border-primary-200/60">
                ₦{parseFloat(task.reward_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">
              {task.title}
            </h1>

            <p className="text-sm text-muted leading-relaxed mb-6">
              {task.description}
            </p>

            {/* Submission Status Alert if user has submitted */}
            {task.userSubmission && (
              <div className={`p-4 rounded-2xl border mb-6 ${
                task.userSubmission.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : task.userSubmission.status === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {task.userSubmission.status === 'approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : task.userSubmission.status === 'rejected' ? (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide">
                      Submission Status: {task.userSubmission.status === 'pending' ? 'Pending Review' : task.userSubmission.status}
                    </h4>
                    <p className="text-xs mt-1">
                      {task.userSubmission.status === 'approved'
                        ? 'Congratulations! Your submission was approved and ₦' + parseFloat(task.reward_amount).toFixed(2) + ' was credited to your available balance.'
                        : task.userSubmission.status === 'rejected'
                        ? `Submission Rejected. Feedback: ${task.userSubmission.admin_feedback || 'Evidence did not fulfill the requirements.'}`
                        : 'Your evidence has been received and is currently in queue for review by our validation team.'}
                    </p>
                    {task.userSubmission.admin_feedback && (
                      <p className="text-[11px] mt-1 italic font-medium">
                        Admin Note: "{task.userSubmission.admin_feedback}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Requirements & Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft space-y-3">
              <h3 className="text-sm font-bold text-dark flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Eligibility Requirements</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                {task.requirements}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft space-y-3">
              <h3 className="text-sm font-bold text-dark flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Step-by-Step Instructions</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                {task.instructions}
              </p>
            </div>
          </div>

          {/* Action Area: Start Task & Evidence Submission */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
            {!isAuthenticated ? (
              <div className="text-center py-6 space-y-3">
                <h3 className="text-base font-bold text-dark">Ready to take on this task?</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Sign in or register for a free account to begin this task and earn ₦{parseFloat(task.reward_amount).toFixed(2)}.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-xs font-semibold text-dark bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft"
                  >
                    Register Free
                  </Link>
                </div>
              </div>
            ) : task.userSubmission?.status === 'approved' ? (
              <div className="text-center py-6 text-emerald-700 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <h3 className="text-base font-bold">Task Completed & Rewarded</h3>
                <p className="text-xs text-muted">You have already earned the reward for this activity.</p>
              </div>
            ) : task.userSubmission?.status === 'pending' ? (
              <div className="text-center py-6 text-amber-800 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-amber-500" />
                <h3 className="text-base font-bold">Submission Pending Review</h3>
                <p className="text-xs text-muted">Our moderators are verifying your evidence. Check your notifications for approval updates.</p>
              </div>
            ) : !isStarted ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
                <div>
                  <h3 className="text-base font-bold text-dark">Start Working on Task</h3>
                  <p className="text-xs text-muted mt-0.5">Click Start Task when you are ready to complete the required steps.</p>
                </div>
                <button
                  onClick={() => setIsStarted(true)}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-soft transition-all"
                >
                  Start Task
                </button>
              </div>
            ) : (
              /* Evidence Submission Form */
              <form onSubmit={handleSubmitEvidence} className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-dark">Submit Task Evidence</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Provide the required proof (notes, transaction ID, screenshot link, or survey confirmation code).
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">
                    Evidence Notes & Confirmation Data
                  </label>
                  <textarea
                    rows={3}
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="e.g. Completed survey. Confirmation code: SURVEY-98124. Tested on Chrome Mobile Android."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">
                    Screenshot Proof URL or Direct Link (Optional if notes contain proof)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                      <Upload className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://postimg.cc/image... or Google Drive public link"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-muted mt-1 block">
                    You can upload screenshots to imgur.com or postimages.org and paste the link here.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsStarted(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-muted hover:text-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl shadow-soft transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit Task</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (isAuthenticated) {
    return <DashboardLayout>{innerContent}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {innerContent}
      </main>
      <Footer />
    </div>
  );
}
