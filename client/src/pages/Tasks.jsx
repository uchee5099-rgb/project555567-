import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Search, Filter, CheckSquare, Sparkles } from 'lucide-react';

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Surveys', 'Apps', 'Social', 'Other'];

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, search]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Available Tasks
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Browse approved micro-tasks, submit required evidence, and earn instant naira rewards.
            </p>
          </div>
          <div className="text-xs font-semibold text-primary bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-200 self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tasks.length} Active Drops</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="bg-surface rounded-2xl p-4 border border-border/80 shadow-soft mb-8 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, keywords or requirements..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-muted font-medium flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-soft shadow-primary/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-dark'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks are currently available"
          description={search ? `No tasks found matching "${search}". Try adjusting your filters.` : 'Check back shortly for newly added tasks.'}
          icon={CheckSquare}
          actionText={search || selectedCategory !== 'All' ? 'Reset Filters' : null}
          onAction={() => { setSearch(''); setSelectedCategory('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );

  // If user is authenticated, render inside DashboardLayout; otherwise show Public Navbar & Footer
  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-dark">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {content}
      </main>
      <Footer />
    </div>
  );
}
