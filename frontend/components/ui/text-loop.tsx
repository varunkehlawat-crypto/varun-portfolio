'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Transition, Variants } from 'motion/react';

export interface TextLoopProps {
  children: React.ReactNode[];
  className?: string;
  interval?: number; // duration in seconds
  transition?: Transition;
  variants?: {
    initial: Variants | any;
    animate: Variants | any;
    exit: Variants | any;
  };
}

export function TextLoop({
  children,
  className = '',
  interval = 3.5,
  transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  variants = {
    initial: { y: 16, opacity: 0, filter: 'blur(8px)' },
    animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { y: -16, opacity: 0, filter: 'blur(8px)' },
  },
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = React.Children.toArray(children);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (!items.length) return null;

  return (
    <span className={`relative inline-flex items-center overflow-hidden vertical-align-middle ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentIndex}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={transition}
          className="inline-flex items-center whitespace-nowrap"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
