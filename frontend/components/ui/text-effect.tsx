'use client';
import { motion, Variants } from 'motion/react';
import React from 'react';

type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
type PerType = 'word' | 'char' | 'line';

interface TextEffectProps {
  children: string;
  per?: PerType;
  preset?: PresetType;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

const defaultVariants: Record<PresetType, { container: Variants; item: Variants }> = {
  blur: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    },
  },
  'fade-in-blur': {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    },
  },
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    },
  },
};

// Map tag names to their motion equivalents
const motionTags: Record<string, React.ElementType> = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  span: motion.span,
  div: motion.div,
  label: motion.label,
};

export function TextEffect({
  children,
  per = 'word',
  preset = 'fade-in-blur',
  delay = 0,
  as = 'p',
  className,
  style,
  variants,
}: TextEffectProps) {
  const { container, item } = variants ?? defaultVariants[preset];

  const segments =
    per === 'char'
      ? children.split('')
      : per === 'line'
      ? children.split('\n')
      : children.split(' ');

  const MotionTag = (motionTags[as] ?? motion.p) as React.ElementType;

  const containerVariants = {
    ...container,
    visible: {
      ...((container as Record<string, unknown>).visible ?? {}),
      transition: {
        ...(((container as Record<string, unknown>).visible as Record<string, unknown>)?.transition ?? {}),
        delayChildren: delay,
      },
    },
  };

  return (
    <MotionTag
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      style={style}
    >
      {segments.map((seg, i) => (
        <motion.span key={i} variants={item} className="inline whitespace-pre-wrap">
          {seg}{per === 'word' && i < segments.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
}
