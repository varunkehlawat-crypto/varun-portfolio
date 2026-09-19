'use client';
import { motion, useInView, Variants } from 'motion/react';
import React, { useRef } from 'react';

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide';
}

const presetVariants: Record<string, { container: Variants; item: Variants }> = {
  fade: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } },
  },
  slide: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
  },
  scale: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
  },
  blur: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0, filter: 'blur(12px)' }, visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6 } } },
  },
  'blur-slide': {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0, filter: 'blur(12px)', y: 30 }, visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } },
  },
};

export function AnimatedGroup({ children, className, preset = 'fade', variants }: AnimatedGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { container, item } = variants ?? presetVariants[preset];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={container}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
