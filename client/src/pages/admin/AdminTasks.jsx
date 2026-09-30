import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X, Loader2, CheckSquare } from 'lucide-react';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Surveys',
    rewardAmount: '',
    estimatedTime: '5 mins',
    requirements: '',
    instructions: '',
    evidenceRequired: true
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tasks');
      if (res.success) setTasks(res.tasks);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      category: 'Surveys',
      rewardAmount: '',
      estimatedTime: '5 mins',
      requirements: '',
      instructions: '',
      evidenceRequired: true
    });
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      rewardAmount: task.reward_amount,
      estimatedTime: task.estimated_time,
      requirements: task.requirements,
      instructions: task.instructions,
      evidenceRequired: task.evidence_required
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingTask) {
        const res = await api.put(`/admin/tasks/${editingTask.id}`, form);
        if (res.success) {
          setMessage('Task updated successfully.');
          setModalOpen(false);
          fetchTasks();
        }
      } else {
        const res = await api.post('/admin/tasks', form);
        if (res.success) {
          setMessage('New task created successfully.');
          setModalOpen(false);
          fetchTasks();
        }
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (task) => {
    try {
      await api.put(`/admin/tasks/${task.id}/status`, { isActive: !task.is_active });
      fetchTasks();
    } catch (e) {}
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${taskId}`);
      fetchTasks();
    } catch (e) {}
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Task Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, edit, toggle availability, and adjust reward payouts.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>

        {message && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-xs text-purple-200">
            {message}
          </div>
        )}

        {/* Task Table */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Reward</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Submissions</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-900 text-purple-300 border border-purple-900/60 px-2 py-0.5 rounded text-[11px]">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400 whitespace-nowrap">
                      ₦{parseFloat(task.reward_amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {task.estimated_time}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {task.current_submissions || 0}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(task)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          task.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {task.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{task.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-950 rounded-3xl max-w-lg w-full p-6 border border-slate-800 shadow-soft-lg text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Surveys">Surveys</option>
                      <option value="Apps">Apps</option>
                      <option value="Social">Social</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Reward (₦)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={form.rewardAmount}
                      onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    required
                    value={form.estimatedTime}
                    onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                    placeholder="e.g. 5 mins"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Requirements</label>
                  <textarea
                    rows={2}
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Step-by-Step Instructions</label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
