"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, ShieldCheck, Stack, CurrencyCircleDollar, type Icon } from "@phosphor-icons/react";

interface Capability {
  icon: Icon;
  title: string;
  description: string;
}

const capabilities: Capability[] = [
  {
    icon: Target,
    title: "Fit-First",
    description:
      "The only tool that tells you whether to apply before you tailor. Stop investing hours in roles that were never going to convert.",
  },
  {
    icon: ShieldCheck,
    title: "Evidence-Based",
    description:
      "Every suggestion is grounded in your real experience. We will never fabricate achievements or invent work you didn't do.",
  },
  {
    icon: Stack,
    title: "Selective, Not Spam",
    description:
      "Built for people running 10–15 strong applications, not 100+ blind ones. Quality over volume is the whole point.",
  },
  {
    icon: CurrencyCircleDollar,
    title: "Unlimited at $39/mo",
    description:
      "No per-use caps, no analysis limits. Run fit checks on every role you're considering and tailor as many resumes as you need.",
  },
];

export function AnimatedStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-24 px-4 bg-gradient-to-b from-[#f6f1eb] via-white to-[#f6f1eb] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex px-4 py-2 rounded-full bg-[#c68a71]/10 border border-[#c68a71]/20 text-[#8d5b46] text-xs font-bold uppercase tracking-wider mb-4">
            What makes it different
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#171411] mb-4 tracking-tight">
            A fit-first tool, not another keyword stuffer
          </h2>
          <p className="text-lg text-[#6e665f]">
            Built on four principles no other resume tool combines
          </p>
        </motion.div>

        {/* Capability grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-[#c68a71]/20 shadow-lg hover:shadow-2xl hover:shadow-[#c68a71]/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c68a71] to-[#f4a261] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Icon */}
              <div className="w-12 h-12 bg-[#c68a71]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#c68a71] transition-colors duration-300">
                <item.icon size={24} weight="duotone" className="text-[#8d5b46] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#171411] mb-3 leading-tight">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#6e665f] leading-relaxed">
                {item.description}
              </p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#c68a71]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
