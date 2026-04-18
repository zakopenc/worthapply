"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface JourneyStep {
  title: string;
  description: string;
  timeline: string;
}

const steps: JourneyStep[] = [
  {
    title: "Sign Up",
    description: "Upload resume once",
    timeline: "Day 1",
  },
  {
    title: "Analyze Jobs",
    description: "10-15 jobs analyzed",
    timeline: "Days 1-3",
  },
  {
    title: "Apply to Top Matches",
    description: "5-8 high-fit applications",
    timeline: "Week 1",
  },
  {
    title: "Get Interviews",
    description: "2-4 interview invites",
    timeline: "Weeks 2-3",
  },
];

export function UserJourney() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="max-w-5xl mx-auto py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-white/60 backdrop-blur-sm rounded-3xl border border-[#c68a71]/15 p-8 lg:p-12 shadow-xl"
      >
        <h3 className="text-3xl font-extrabold text-[#171411] text-center mb-12 tracking-tight">
          Average User Journey
        </h3>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:flex items-start justify-between relative">
          {steps.map((step, index) => (
            <div key={step.title} className="flex-1 flex flex-col items-center relative">
              {/* Connecting line (except last) */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-1/2 w-full h-1 -z-10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    className="h-full bg-gradient-to-r from-[#c68a71]/30 to-[#f4a261]/30 origin-left"
                  />
                </div>
              )}

              {/* Icon Circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative mb-6 group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c68a71] to-[#f4a261] flex items-center justify-center shadow-lg shadow-[#c68a71]/40 relative z-10">
                  <span className="text-3xl font-black text-white">{index + 1}</span>
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c68a71] to-[#f4a261]"
                />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                className="text-center"
              >
                <h4 className="text-lg font-bold text-[#171411] mb-2">{step.title}</h4>
                <p className="text-sm text-[#6e665f] mb-3 max-w-[160px]">{step.description}</p>
                <span className="inline-flex px-3 py-1 rounded-full bg-[#c68a71]/10 border border-[#c68a71]/20 text-[#c68a71] text-xs font-bold uppercase tracking-wider">
                  {step.timeline}
                </span>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-6 relative">
              {/* Connecting line (except last) */}
              {index < steps.length - 1 && (
                <div className="absolute left-10 top-20 w-1 h-full -z-10">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    className="w-full h-full bg-gradient-to-b from-[#c68a71]/30 to-[#f4a261]/30 origin-top"
                  />
                </div>
              )}

              {/* Icon Circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative flex-shrink-0"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c68a71] to-[#f4a261] flex items-center justify-center shadow-lg shadow-[#c68a71]/40 relative z-10">
                  <span className="text-3xl font-black text-white">{index + 1}</span>
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c68a71] to-[#f4a261]"
                />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                className="flex-1 pt-2"
              >
                <h4 className="text-xl font-bold text-[#171411] mb-2">{step.title}</h4>
                <p className="text-sm text-[#6e665f] mb-3">{step.description}</p>
                <span className="inline-flex px-3 py-1 rounded-full bg-[#c68a71]/10 border border-[#c68a71]/20 text-[#c68a71] text-xs font-bold uppercase tracking-wider">
                  {step.timeline}
                </span>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
