'use client';
import React from 'react';
import { motion } from 'motion/react';
import { TextLoop } from './text-loop';
import { TextEffect } from './text-effect';

interface HeroRoleBadgeProps {
  className?: string;
}

export function HeroRoleBadge({ className = '' }: HeroRoleBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all duration-300 shadow-2xl cursor-default group overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
        border: '1px solid rgba(53, 228, 255, 0.25)',
        boxShadow: '0 0 30px rgba(53, 228, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Animated Light Sweep Background Beam */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500"
        animate={{
          background: [
            'radial-gradient(circle at 0% 50%, rgba(53,228,255,0.25) 0%, transparent 60%)',
            'radial-gradient(circle at 100% 50%, rgba(167,139,250,0.25) 0%, transparent 60%)',
            'radial-gradient(circle at 0% 50%, rgba(53,228,255,0.25) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulsing Emerald/Cyan Status Indicator Dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-[0_0_10px_#35E4FF]" />
      </span>

      {/* Main Roles Content with Dynamic Motion Primitives */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 text-slate-200">
        {/* Role 1 Badge */}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400 drop-shadow-[0_0_12px_rgba(53,228,255,0.4)]">
          Full Stack Developer
        </span>

        {/* Glowing Separator Dot / Diamond */}
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_6px_#35E4FF]" />

        {/* Role 2 with TextLoop Motion Primitive */}
        <TextLoop
          interval={3.8}
          className="font-medium text-purple-200"
        >
          <span className="flex items-center gap-1.5 text-purple-300">
            <span className="text-purple-400 font-semibold">🎓 BCA AI &amp; DS Student</span>
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="text-cyan-400 font-semibold">🤖 AI &amp; Data Science Specialist</span>
          </span>
          <span className="flex items-center gap-1.5 text-pink-300">
            <span className="text-pink-400 font-semibold">⚡ Modern Web &amp; Next.js Creator</span>
          </span>
        </TextLoop>
      </div>

      {/* Shimmer Border Beam Edge */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          padding: '1px',
          background: 'linear-gradient(90deg, rgba(53,228,255,0.4) 0%, rgba(167,139,250,0.4) 50%, rgba(53,228,255,0.4) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </motion.div>
  );
}
