import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { ShieldAlert, Terminal } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.success) setLogs(res.auditLogs);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            System logs recording financial modifications, account activations, status changes, and reviewer actions.
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Log ID</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Admin</th>
                  <th className="px-5 py-3.5">Action Executed</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Parameters & Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">#{log.id}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-NG')}
                    </td>
                    <td className="px-5 py-3.5 text-purple-300">
                      {log.admin_name || 'System / Admin'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {log.target_type} #{log.target_id || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
