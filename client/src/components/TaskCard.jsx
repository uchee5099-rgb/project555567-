import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge from './Badge';

export default function TaskCard({ task }) {
  const isCompleted = task.userSubmission?.status === 'approved';
  const isPending = task.userSubmission?.status === 'pending';

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5">
      <div>
        {/* Top Header: Category & Reward */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge status={task.category} />
          <span className="text-base font-bold text-primary bg-primary-50 px-3 py-1 rounded-xl">
            ₦{parseFloat(task.reward_amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-dark group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {task.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div>
        {/* Metadata: Time & Submission status */}
        <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-slate-100 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{task.estimated_time || '5 mins'}</span>
          </div>

          <div>
            {task.userSubmission ? (
              <Badge status={task.userSubmission.status} />
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Available
              </span>
            )}
          </div>
        </div>

        {/* View Task CTA */}
        <Link
          to={`/tasks/${task.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-dark transition-all duration-150"
        >
          <span>{task.userSubmission ? 'View Submission' : 'View Task'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
