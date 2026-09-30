import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Bell, CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { refreshUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshUser();
    } catch (e) {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Updates on your task approvals, referral signups, and withdrawal disbursements.
            </p>
          </div>

          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="You will be notified whenever your submissions are reviewed or rewards are credited."
            icon={Bell}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.is_read
                    ? 'bg-surface border-primary/30 shadow-soft'
                    : 'bg-surface/70 border-border/60'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : n.type === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-primary-50 text-primary'
                }`}>
                  {n.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : n.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold text-dark">{n.title}</h3>
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-2"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
