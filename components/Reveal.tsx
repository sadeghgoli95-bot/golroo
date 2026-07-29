"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Subtle scroll-triggered fade/rise for section-level rhythm — mirrors the
 * existing .fade-up mount animation but fires once when a section enters
 * the viewport instead of on page load, so a long homepage reveals in
 * calm stages rather than all at once.
 */
export default function Reveal({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
