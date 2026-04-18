'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Adds the `visible` class to elements with `animate-on-scroll`
 * when they enter the viewport via IntersectionObserver.
 *
 * Usage:
 *   const containerRef = useScrollAnimation();
 *   <div ref={containerRef}> ... children with className="animate-on-scroll" ... </div>
 *
 * Or call with no ref to observe the entire document body.
 */
export function useScrollAnimation(threshold = 0.15) {
  const containerRef = useRef<HTMLDivElement>(null);

  const observe = useCallback(() => {
    const root = containerRef.current ?? document.body;
    const targets = root.querySelectorAll('.animate-on-scroll');

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    // Small delay so the DOM has painted before we observe.
    const id = requestAnimationFrame(() => {
      observe();
    });
    return () => cancelAnimationFrame(id);
  }, [observe]);

  return containerRef;
}
