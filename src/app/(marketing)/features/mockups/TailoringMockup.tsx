'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';

const beforeBullets = [
  'Software Engineer with experience in web development and databases.',
  'Built various web applications using modern frameworks.',
  'Managed projects and collaborated with team members.',
];

const afterBullets = [
  'Python Developer | 5+ Years Specialized in backend systems & API design',
  'Built scalable REST APIs serving 1M+ requests/day with FastAPI & PostgreSQL',
  'Led cross-functional team of 4, delivering 3 major product launches on time',
];

export function TailoringMockup() {
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
          <span className="text-stone-400 text-xs font-medium ml-2">Resume Tailoring</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkle size={12} weight="duotone" className="text-amber-400" />
            <span className="text-stone-400 text-[11px]">AI-Enhanced</span>
          </div>
        </div>

        <div className="p-5">
          {/* Score comparison */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-2xl font-extrabold text-red-400">42%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Before</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-1"
            >
              <div className="w-12 h-[2px] bg-gradient-to-r from-red-300 to-emerald-400" />
              <ArrowRight size={16} weight="bold" className="text-emerald-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="text-center"
            >
              <div className="text-2xl font-extrabold text-emerald-500">89%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">After</div>
            </motion.div>
          </div>

          {/* Before/After columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-red-50/50 rounded-xl p-4 border border-red-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">Before</span>
              </div>
              <div className="space-y-3">
                {beforeBullets.map((bullet, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.15 }}
                    className="text-[11px] leading-relaxed text-stone-500 pl-3 border-l-2 border-red-200"
                  >
                    {bullet}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">After</span>
              </div>
              <div className="space-y-3">
                {afterBullets.map((bullet, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.9 + i * 0.15 }}
                  >
                    <div className="text-[11px] leading-relaxed text-stone-700 font-medium pl-3 border-l-2 border-emerald-400">
                      {bullet}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhancement tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="flex flex-wrap gap-2 mt-4 justify-center"
          >
            {['+Quantified impact', '+Role-specific keywords', '+Action verbs'].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700"
              >
                <Sparkle size={10} weight="duotone" />
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
