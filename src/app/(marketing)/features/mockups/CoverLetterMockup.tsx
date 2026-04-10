'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Copy, CheckCircle } from '@phosphor-icons/react';

const contextItems = [
  { label: 'Company', value: 'TechCorp' },
  { label: 'Position', value: 'Senior Engineer' },
  { label: 'Match', value: '89%' },
];

const contextSkills = ['Python', 'FastAPI', 'System Design', 'Team Leadership'];

const letterLines = [
  'Dear Hiring Manager,',
  '',
  "I'm excited to apply for the Senior Engineer position at TechCorp. With 5+ years building scalable Python systems, my experience aligns well with your team's focus on high-performance backend architecture.",
  '',
  "In my current role at DataFlow, I've led a team of 4 engineers developing REST APIs that serve 1M+ requests daily using FastAPI and PostgreSQL — the same stack highlighted in your requirements.",
  '',
  'I would welcome the opportunity to bring this hands-on experience to TechCorp and contribute to your engineering culture...',
];

export function CoverLetterMockup() {
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
          <span className="text-stone-400 text-xs font-medium ml-2">Cover Letter Generator</span>
          <div className="ml-auto flex items-center gap-1.5">
            <FileText size={12} weight="duotone" className="text-amber-400" />
            <span className="text-stone-400 text-[11px]">Evidence-Based</span>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            {/* Context sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-stone-50 rounded-xl p-3.5 border border-stone-100"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">Context</p>
              <div className="space-y-2.5 mb-4">
                {contextItems.map((item) => (
                  <div key={item.label}>
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">{item.label}</div>
                    <div className="text-xs font-bold text-stone-800">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Key Skills</p>
              <div className="space-y-1.5">
                {contextSkills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle size={10} weight="fill" className="text-emerald-500" />
                    <span className="text-[11px] text-stone-600">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Letter content */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-4 border border-stone-200 relative"
            >
              <div className="space-y-0">
                {letterLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.12 }}
                    className={`text-[11px] leading-relaxed ${
                      i === 0 ? 'font-semibold text-stone-800 mb-3' : 'text-stone-600'
                    } ${line === '' ? 'h-2' : ''}`}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              {/* Evidence highlight */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.6 }}
                className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle size={11} weight="fill" className="text-amber-600" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Evidence Integrated</span>
                </div>
                <p className="text-[10px] text-amber-700">3 claims backed by your resume data</p>
              </motion.div>

              {/* Copy button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.8 }}
                className="mt-3 flex justify-end"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold cursor-default">
                  <Copy size={11} weight="bold" />
                  Copy to Clipboard
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
