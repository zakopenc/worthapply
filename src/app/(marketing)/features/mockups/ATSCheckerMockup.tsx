'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Warning, XCircle, Scan } from '@phosphor-icons/react';

const checks = [
  { icon: CheckCircle, weight: 'fill', text: 'Contact info parsed correctly', status: 'pass', color: '#10b981' },
  { icon: CheckCircle, weight: 'fill', text: 'Experience section detected', status: 'pass', color: '#10b981' },
  { icon: CheckCircle, weight: 'fill', text: 'Education section found', status: 'pass', color: '#10b981' },
  { icon: Warning, weight: 'fill', text: 'Add more keywords from job posting', status: 'warn', color: '#f59e0b' },
  { icon: CheckCircle, weight: 'fill', text: 'PDF format is ATS-readable', status: 'pass', color: '#10b981' },
  { icon: XCircle, weight: 'fill', text: 'Header/footer content may be skipped', status: 'fail', color: '#ef4444' },
];

const keywords = [
  { word: 'Python', found: true },
  { word: 'FastAPI', found: true },
  { word: 'PostgreSQL', found: true },
  { word: 'Docker', found: false },
  { word: 'CI/CD', found: true },
  { word: 'AWS', found: false },
  { word: 'REST API', found: true },
  { word: 'Agile', found: true },
];

export function ATSCheckerMockup() {
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
          <span className="text-stone-400 text-xs font-medium ml-2">ATS Compatibility Check</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Scan size={12} weight="bold" className="text-amber-400" />
            <span className="text-stone-400 text-[11px]">Scan Complete</span>
          </div>
        </div>

        <div className="p-5">
          {/* Score section */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f0ebe5" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="url(#atsGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={isInView ? { strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.82) } : {}}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.4, 0, 1] as const }}
                />
                <defs>
                  <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c68a71" />
                    <stop offset="100%" stopColor="#f4a261" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-2xl font-extrabold text-stone-900"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  82
                </motion.span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">ATS Score</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-stone-500">Formatting</span>
                    <span className="text-[10px] font-bold text-stone-700">90%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '90%' } : {}}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full bg-emerald-400"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-stone-500">Keywords</span>
                    <span className="text-[10px] font-bold text-stone-700">75%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '75%' } : {}}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="h-full rounded-full bg-amber-400"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-stone-500">Structure</span>
                    <span className="text-[10px] font-bold text-stone-700">85%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '85%' } : {}}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="h-full rounded-full bg-[#c68a71]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">Keyword Coverage</p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <motion.span
                  key={kw.word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.2, delay: 0.6 + i * 0.06 }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    kw.found
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-500 border border-red-200 line-through'
                  }`}
                >
                  {kw.word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-stone-50 rounded-xl p-3.5 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Compatibility Checks</p>
            {checks.map((check, i) => (
              <motion.div
                key={check.text}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.25, delay: 1.0 + i * 0.08 }}
                className="flex items-center gap-2"
              >
                <check.icon size={14} weight={check.weight as 'fill'} style={{ color: check.color }} className="flex-shrink-0" />
                <span className="text-[11px] text-stone-600">{check.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
