import React, { useState, useEffect, useRef } from 'react';

export default function StatsCounter({ targetValue, suffix = '', isDecimal = false, duration = 1800 }) {
  // Default to targetValue so it is never 0 on load or headless render
  const [currentValue, setCurrentValue] = useState(targetValue);
  const elementRef = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || animatedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCurrentValue(easeOut * targetValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCurrentValue(targetValue);
            }
          };

          // Reset to 0 and start animation
          setCurrentValue(0);
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [targetValue, duration]);

  const formattedValue = isDecimal 
    ? currentValue.toFixed(1)
    : Math.floor(currentValue).toLocaleString();

  return (
    <span ref={elementRef} className="tabular-nums">
      {formattedValue}{suffix}
    </span>
  );
}
