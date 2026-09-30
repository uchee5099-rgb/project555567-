import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { CheckCircle2, XCircle, Clock, ExternalLink, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/submissions');
      if (res.success) setSubmissions(res.submissions);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedSub) return;
    setReviewing(true);
    setMessage('');
    try {
      const res = await api.put(`/admin/submissions/${selectedSub.id}/review`, {
        status,
        adminFeedback: feedback.trim()
      });

      if (res.success) {
        setMessage(`Submission ${status === 'approved' ? 'APPROVED and ₦' + parseFloat(selectedSub.reward_amount).toFixed(2) + ' credited to user' : 'REJECTED'}.`);
        setSelectedSub(null);
        setFeedback('');
        fetchSubmissions();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Submission Verification Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user task evidence. Approving a submission automatically credits the reward to the user's available balance and logs a transaction.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-xs text-purple-200">
            {message}
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Submission ID</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Reward</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      SUB-#{sub.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{sub.user_name || 'User'}</div>
                      <div className="text-[11px] text-slate-400">{sub.user_email}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-200 max-w-xs truncate">
                      {sub.task_title || `Task #${sub.task_id}`}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400 whitespace-nowrap">
                      ₦{parseFloat(sub.reward_amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sub.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : sub.status === 'rejected'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {sub.status === 'pending' ? <Clock className="w-3 h-3" /> : null}
                        <span>{sub.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedSub(sub); setFeedback(sub.admin_feedback || ''); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-soft transition-colors"
                      >
                        {sub.status === 'pending' ? 'Review Evidence' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Evidence Modal */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-950 rounded-3xl max-w-lg w-full p-6 border border-slate-800 shadow-soft-lg text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Review Evidence Submission</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: #{selectedSub.id} • Reward: ₦{parseFloat(selectedSub.reward_amount).toFixed(2)}</span>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-200">Task: {selectedSub.task_title}</div>
                  <div className="text-slate-400">User: {selectedSub.user_name} ({selectedSub.user_email})</div>
                </div>

                {/* Evidence Text */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Submitted Notes / Confirmation Hash:</label>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-200 whitespace-pre-wrap">
                    {selectedSub.evidence_text || 'No text note provided.'}
                  </div>
                </div>

                {/* Evidence URL / Screenshot */}
                {selectedSub.evidence_url && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Evidence Screenshot / Link:</label>
                    <a
                      href={selectedSub.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-purple-400 hover:underline mb-2"
                    >
                      <span>Open Link in New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {selectedSub.evidence_url.match(/\.(jpeg|jpg|gif|png|webp)/i) && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-48">
                        <img src={selectedSub.evidence_url} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Feedback */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Admin Feedback / Reason:</label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Validated receipt successfully. OR: Screenshot blurry / code mismatch."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Review Action Buttons */}
                {selectedSub.status === 'pending' ? (
                  <div className="pt-3 flex gap-3">
                    <button
                      onClick={() => handleReview('rejected')}
                      disabled={reviewing}
                      className="flex-1 py-2.5 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Evidence</span>
                    </button>
                    <button
                      onClick={() => handleReview('approved')}
                      disabled={reviewing}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold flex items-center justify-center gap-1.5 shadow-soft transition-colors"
                    >
                      {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Approve & Credit ₦{parseFloat(selectedSub.reward_amount).toFixed(2)}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-center text-slate-400 text-xs font-semibold">
                    This submission has already been marked as <span className="uppercase text-white">{selectedSub.status}</span>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
