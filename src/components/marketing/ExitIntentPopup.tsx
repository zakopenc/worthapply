'use client';

import { useState, useEffect } from 'react';
import { X, Sparkle, Target } from '@phosphor-icons/react';
import Link from 'next/link';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving at top of viewport
      if (e.clientY <= 0 && !sessionStorage.getItem('exit-intent-shown')) {
        setShow(true);
        sessionStorage.setItem('exit-intent-shown', 'true');
      }
    };

    // Delay to avoid triggering on initial page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-md relative shadow-2xl animate-slide-up">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={24} weight="fill" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Target className="w-8 h-8 text-white" weight="duotone" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Wait! Get Your Free Job Fit Report
        </h3>
        <p className="text-gray-600 mb-6 text-center leading-relaxed">
          Before you go, try our analyzer on <strong>ANY job posting</strong>. See your fit score in 10 seconds. No signup required.
        </p>

        <Link
          href="/demo"
          onClick={() => setShow(false)}
          className="block w-full bg-gradient-to-r from-secondary to-primary text-white text-center py-4 rounded-xl font-semibold hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 mb-4"
        >
          <span className="flex items-center justify-center gap-2">
            <Sparkle size={20} weight="duotone" />
            Try Demo Now (No Email Needed)
          </span>
        </Link>

        {/* Social Proof */}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>
            <strong className="text-gray-900">892</strong> people tried the demo today
          </span>
        </div>

        {/* Small print */}
        <button
          onClick={() => setShow(false)}
          className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4"
        >
          No thanks, I&apos;ll figure it out myself
        </button>
      </div>
    </div>
  );
}
