'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target, Bookmark, Send, Calendar, Trophy, XCircle,
  MapPin, Banknote, Clock, Loader2, AlertTriangle,
} from 'lucide-react';
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_VALUES,
  type ApplicationStatus,
} from '@/lib/application-status';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: ApplicationStatus;
  location?: string;
  salary_info?: string;
  applied_date?: string;
  notes?: string;
  created_at: string;
}

const STATUS_ICONS: Partial<Record<string, React.ElementType>> = {
  wishlist:  Bookmark,
  applied:   Send,
  interview: Calendar,
  offer:     Trophy,
  rejected:  XCircle,
};

const STATUS_COLORS: Partial<Record<string, { col: string; dot: string; ring: string }>> = {
  wishlist:  { col: 'bg-blue-50 border-blue-100',     dot: 'bg-blue-400',   ring: 'ring-blue-300/40' },
  applied:   { col: 'bg-amber-50 border-amber-100',   dot: 'bg-amber-400',  ring: 'ring-amber-300/40' },
  interview: { col: 'bg-violet-50 border-violet-100', dot: 'bg-violet-400', ring: 'ring-violet-300/40' },
  offer:     { col: 'bg-green-50 border-green-100',   dot: 'bg-green-400',  ring: 'ring-green-300/40' },
  rejected:  { col: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-300',   ring: 'ring-gray-300/40' },
};

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<string | null>(null);

  useEffect(() => { loadApplications(); }, []);

  async function loadApplications() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to load applications');
      const data = await res.json();
      setApplications(data.data || data.applications || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(appId: string, newStatus: ApplicationStatus) {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      setError((err as Error).message);
      loadApplications();
    }
  }

  const byStatus = APPLICATION_STATUS_VALUES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header — matches analyzer style */}
      <header className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-widest mb-2 text-on-surface-variant/60">
          Workspace / Pipeline Tracker
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              Pipeline Tracker
            </h1>
            <p className="text-on-surface-variant mt-1 max-w-2xl">
              Drag cards between columns to update status. Every move is saved automatically.
            </p>
          </div>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 active:scale-95 transition-all shadow-lg whitespace-nowrap"
          >
            <Target className="w-4 h-4" /> Analyze a new job
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant/40" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-on-surface-variant/30" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No applications yet</h3>
          <p className="text-on-surface-variant mb-6 max-w-sm mx-auto text-sm">
            Analyze a job and save it to your pipeline to start tracking your search.
          </p>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 transition-all"
          >
            <Target className="w-4 h-4" /> Analyze your first job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {APPLICATION_STATUS_VALUES.map((status) => {
            const meta = APPLICATION_STATUS_META[status];
            const colors = STATUS_COLORS[status] ?? { col: 'bg-gray-50 border-gray-200', dot: 'bg-gray-300', ring: 'ring-gray-300/40' };
            const cards = byStatus[status] ?? [];
            const isOver = overStatus === status;

            return (
              <div
                key={status}
                className={`rounded-2xl border p-4 min-h-[420px] transition-all duration-150 ${colors.col} ${isOver ? `ring-2 ${colors.ring} scale-[1.01]` : ''}`}
                onDragOver={(e) => { e.preventDefault(); setOverStatus(status); }}
                onDragLeave={() => setOverStatus(null)}
                onDrop={() => {
                  if (draggedId) updateStatus(draggedId, status);
                  setDraggedId(null);
                  setOverStatus(null);
                }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="font-bold text-sm text-on-surface">{meta.label}</span>
                  </div>
                  <span className="bg-white rounded-full px-2.5 py-0.5 text-xs font-bold text-on-surface shadow-sm border border-outline-variant/10">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {cards.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => setDraggedId(app.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className="bg-white rounded-xl p-4 border border-outline-variant/10 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing active:scale-95 transition-all"
                    >
                      <h4 className="font-bold text-on-surface text-sm leading-snug mb-0.5">{app.job_title}</h4>
                      <p className="text-xs text-on-surface-variant mb-3">{app.company}</p>
                      {app.location && (
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant/70 mb-1">
                          <MapPin className="w-3 h-3 shrink-0" /> {app.location}
                        </div>
                      )}
                      {app.salary_info && (
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant/70 mb-1">
                          <Banknote className="w-3 h-3 shrink-0" /> {app.salary_info}
                        </div>
                      )}
                      {app.applied_date && (
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant/40 mt-2">
                          <Clock className="w-3 h-3 shrink-0" />
                          Applied {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ))}

                  {cards.length === 0 && (
                    <div className="text-center py-10 text-on-surface-variant/30 text-xs font-medium">
                      Drop cards here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
