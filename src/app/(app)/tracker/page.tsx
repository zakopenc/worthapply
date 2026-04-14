'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
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

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to load applications');
      }

      const data = await response.json();
      setApplications(data.data || data.applications || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(appId: string, newStatus: ApplicationStatus) {
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      setError((err as Error).message || 'Failed to update status');
    }
  }

  function handleDragStart(appId: string) {
    setDraggedCard(appId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(status: ApplicationStatus) {
    if (draggedCard) {
      updateApplicationStatus(draggedCard, status);
      setDraggedCard(null);
    }
  }

  const applicationsByStatus = APPLICATION_STATUS_VALUES.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  return (
    <>
      <div className="max-w-[1400px] mx-auto py-12 px-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-5xl font-black tracking-tight text-on-surface mb-4">
            Pipeline tracker
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl leading-relaxed">
            Manage your job applications with a visual kanban board. Drag cards
            between columns to update status.
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error rounded-xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-on-surface/60">Loading applications...</div>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {APPLICATION_STATUS_VALUES.map((status) => {
              const meta = APPLICATION_STATUS_META[status];

              return (
                <div
                  key={status}
                  className={`${meta.boardColor} rounded-2xl p-5 min-h-[500px]`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        {meta.icon}
                      </span>
                      <h3 className="font-bold text-on-surface">{meta.label}</h3>
                    </div>
                    <div className="bg-white rounded-full px-3 py-1 text-sm font-semibold text-on-surface">
                      {applicationsByStatus[status]?.length || 0}
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {applicationsByStatus[status]?.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => handleDragStart(app.id)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-move"
                    >
                      <h4 className="font-bold text-on-surface mb-1">
                        {app.job_title}
                      </h4>
                      <p className="text-sm text-on-surface/60 mb-3">
                        {app.company}
                      </p>
                      {app.location && (
                        <div className="flex items-center gap-1 text-xs text-on-surface/50 mb-2">
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          {app.location}
                        </div>
                      )}
                      {app.salary_info && (
                        <div className="flex items-center gap-1 text-xs text-on-surface/50 mb-2">
                          <span className="material-symbols-outlined text-[14px]">
                            payments
                          </span>
                          {app.salary_info}
                        </div>
                      )}
                      {app.applied_date && (
                        <div className="text-xs text-on-surface/40 mt-2">
                          Applied: {new Date(app.applied_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}

                    {applicationsByStatus[status]?.length === 0 && (
                      <div className="text-center py-10 text-on-surface/40 text-sm">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[80px] text-on-surface/20 mb-4">
              inbox
            </span>
            <h3 className="text-2xl font-bold text-on-surface mb-2">
              No applications yet
            </h3>
            <p className="text-on-surface/60 mb-6">
              Analyze jobs and save them to your pipeline to get started
            </p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/analyzer')}
              icon={
                <span className="material-symbols-outlined text-[20px]">
                  analytics
                </span>
              }
              iconPosition="left"
            >
              Analyze your first job
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
