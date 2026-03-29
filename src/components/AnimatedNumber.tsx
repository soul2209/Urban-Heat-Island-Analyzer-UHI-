import { useState, useEffect, useRef } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

/**
 * AnimatedNumber — smoothly counts from one number to another.
 * Uses framer-motion's spring physics for natural easing.
 */
export function AnimatedNumber({
  value,
  duration = 0.5,
  decimals = 1,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, {
    stiffness: 80,
    damping: 25,
    duration: duration * 1000,
  });
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    motionVal.set(value);
    const unsub = spring.on('change', (v) => {
      const rounded = Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
      setDisplay(rounded);
    });
    return unsub;
  }, [value, motionVal, spring, decimals]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <span className={className}>{display}</span>;
}

/**
 * AnimatedColor — renders a div/span that smoothly transitions its background-color.
 */
export function AnimatedColor({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // For color animation, we use CSS transitions since
  // framer-motion color interpolation needs hex values.
  // We'll use inline style with transition.
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundColor: color,
        transition: 'background-color 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    />
  );
}
