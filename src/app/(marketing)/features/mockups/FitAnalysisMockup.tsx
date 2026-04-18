'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Warning, Lightning, TrendUp } from '@phosphor-icons/react';

const skills = [
  { name: 'Python', match: true },
  { name: 'System Design', match: true },
  { name: 'FastAPI', match: true },
  { name: 'PostgreSQL', match: true },
  { name: 'Kubernetes', match: false },
  { name: 'Team Leadership', match: true },
];

const insights = [
  { icon: CheckCircle, weight: 'fill', text: 'Strong skill alignment (6/7 required)', color: '#10b981' },
  { icon: CheckCircle, weight: 'fill', text: '5+ years matches their requirement', color: '#10b981' },
  { icon: Warning, weight: 'fill', text: 'Missing: Kubernetes (nice to have)', color: '#f59e0b' },
  { icon: TrendUp, weight: 'duotone', text: 'Resume mentions 80% of keywords', color: '#10b981' },
];

export function FitAnalysisMockup() {
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
          <span className="text-stone-400 text-xs font-medium ml-2">Job Fit Analysis</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Lightning size={12} weight="bold" className="text-amber-400" />
            <span className="text-stone-400 text-[11px]">Completed in 8s</span>
          </div>
        </div>

        <div className="p-6">
          {/* Score + Verdict row */}
          <div className="flex items-center gap-6 mb-6">
            {/* Circular score */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f0ebe5" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={isInView ? { strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.89) } : {}}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.4, 0, 1] as const }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-extrabold text-stone-900"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  89%
                </motion.span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Match</span>
              </div>
            </div>

            {/* Verdict */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Strong Fit</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Senior Backend Engineer at <span className="font-semibold text-stone-800">TechCorp</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">San Francisco, CA &middot; $180k-$220k</p>
              </motion.div>
            </div>
          </div>

          {/* Skills grid */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Skill Alignment</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    skill.match
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {skill.match ? <CheckCircle size={12} weight="fill" /> : <Warning size={12} weight="fill" />}
                  {skill.name}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Key Insights</p>
            {insights.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 1.0 + i * 0.12 }}
                className="flex items-start gap-2.5"
              >
                <item.icon size={15} weight={item.weight as 'fill' | 'duotone'} style={{ color: item.color }} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm text-stone-700 leading-snug">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
