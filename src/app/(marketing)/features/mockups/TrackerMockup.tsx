'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, CalendarBlank, TrendUp } from '@phosphor-icons/react';

const stats = [
  { label: 'Applied', value: '12', icon: Briefcase, color: '#c68a71' },
  { label: 'Interviews', value: '5', icon: CalendarBlank, color: '#10b981' },
  { label: 'Avg Match', value: '89%', icon: TrendUp, color: '#f4a261' },
];

const applications = [
  { company: 'TechCorp', role: 'Senior Engineer', match: 89, status: 'Interview', statusColor: 'bg-emerald-100 text-emerald-700', date: 'Apr 3' },
  { company: 'StartupXYZ', role: 'Backend Dev', match: 85, status: 'Applied', statusColor: 'bg-amber-100 text-amber-700', date: 'Apr 3' },
  { company: 'BigCo', role: 'Full Stack', match: 78, status: 'Reviewed', statusColor: 'bg-blue-100 text-blue-700', date: 'Apr 2' },
  { company: 'DataFlow', role: 'Platform Eng', match: 92, status: 'Offer', statusColor: 'bg-purple-100 text-purple-700', date: 'Apr 1' },
];

export function TrackerMockup() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="w-full max-w-[540px] mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200/60 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-stone-400 text-xs font-medium ml-2">Application Tracker</span>
        </div>

        <div className="p-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100"
              >
                <div className="flex items-center justify-center mb-1.5">
                  <stat.icon size={14} weight="duotone" style={{ color: stat.color }} />
                </div>
                <div className="text-xl font-extrabold text-stone-900">{stat.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-stone-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_60px_80px_50px] gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-100">
              {['Company', 'Position', 'Match', 'Status', 'Date'].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{h}</span>
              ))}
            </div>

            {/* Table rows */}
            {applications.map((app, i) => (
              <motion.div
                key={app.company}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                className="grid grid-cols-[1fr_1fr_60px_80px_50px] gap-2 px-4 py-3 border-b border-stone-50 last:border-0 items-center hover:bg-stone-50/50 transition-colors"
              >
                <span className="text-xs font-semibold text-stone-800">{app.company}</span>
                <span className="text-xs text-stone-600">{app.role}</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${app.match}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#c68a71] to-[#f4a261]"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-stone-700">{app.match}%</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${app.statusColor}`}>
                  {app.status}
                </span>
                <span className="text-[11px] text-stone-400">{app.date}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
