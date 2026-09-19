'use client';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface InViewProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    hidden: Record<string, unknown>;
    visible: Record<string, unknown>;
  };
  transition?: Record<string, unknown>;
  viewOptions?: { once?: boolean; margin?: string };
}

export function InView({
  children,
  className,
  variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  viewOptions = { once: true, margin: '-60px' },
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewOptions);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants as any}
      transition={transition as any}
      className={className}
    >
      {children}
    </motion.div>
  );
}
