'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
  total: { lastYear: number };
  contributions: ContributionDay[];
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  count: number;
};

const LEVEL_COLORS = [
  'rgba(16,21,44,0.7)',
  'rgba(53,228,255,0.20)',
  'rgba(53,228,255,0.45)',
  'rgba(53,228,255,0.72)',
  '#35E4FF',
];

const LEVEL_GLOW = [
  'none',
  'none',
  '0 0 4px rgba(53,228,255,0.25)',
  '0 0 6px rgba(53,228,255,0.45)',
  '0 0 10px rgba(53,228,255,0.7)',
];

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildWeeks(contributions: ContributionDay[]): (ContributionDay | null)[][] {
  if (!contributions.length) return [];
  const first = new Date(contributions[0].date);
  const startDow = first.getDay();
  const weeks: (ContributionDay | null)[][] = [];
  let week: (ContributionDay | null)[] = Array(startDow).fill(null);
  for (const day of contributions) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function getMonthLabels(weeks: (ContributionDay | null)[][]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const first = week.find(Boolean);
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (m !== lastMonth) { labels.push({ label: MONTHS[m], col }); lastMonth = m; }
  });
  return labels;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GitHubHeatmap({ username }: { username: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false);
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [username]);

  const weeks = data ? buildWeeks(data.contributions) : [];
  const monthLabels = getMonthLabels(weeks);
  const totalLastYear = data?.total?.lastYear ?? 0;

  const contributions = data?.contributions ?? [];
  const peak = contributions.reduce((m, d) => d.count > m ? d.count : m, 0);
  let maxStreak = 0, cur = 0;
  for (const d of contributions) {
    if (d.count > 0) { cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  }

  function handleCellEnter(e: React.MouseEvent, day: ContributionDay) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parent = containerRef.current?.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left - (parent?.left ?? 0) + rect.width / 2,
      y: rect.top - (parent?.top ?? 0) - 8,
      date: formatDate(day.date),
      count: day.count,
    });
  }

  return (
    <div className="w-full" style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>

      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: '#35E4FF' }}>
            GitHub Activity
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#EAF0FF', fontFamily: "'Space Grotesk', sans-serif" }}>
            Contribution Graph
          </h2>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 inline-flex items-center gap-1 transition-colors"
            style={{ color: '#96A2C6' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#35E4FF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#96A2C6')}
          >
            @{username} ↗
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Last year', value: totalLastYear, suffix: ' commits' },
            { label: 'Peak day',  value: peak,          suffix: ' commits' },
            { label: 'Max streak',value: maxStreak,     suffix: ' days'    },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(16,21,44,0.7)', border: '1px solid rgba(53,228,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="text-lg font-black" style={{ color: '#35E4FF' }}>
                {loading ? '—' : value}
                <span className="text-xs font-normal" style={{ color: '#5C688C' }}>{suffix}</span>
              </div>
              <div className="text-xs" style={{ color: '#5C688C' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div ref={containerRef} className="relative rounded-2xl overflow-x-auto"
        style={{
          background: 'rgba(10,14,28,0.6)',
          border: '1px solid rgba(53,228,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(53,228,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '24px 20px 20px',
        }}>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#35E4FF' }}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-center py-12 text-sm" style={{ color: '#5C688C' }}>
            Could not load contributions for <span style={{ color: '#35E4FF' }}>@{username}</span>
          </p>
        )}

        {!loading && !error && data && (
          <div style={{ minWidth: weeks.length * 13 }}>

            {/* Month labels */}
            <div className="flex mb-1" style={{ paddingLeft: 32 }}>
              {weeks.map((_, col) => {
                const lbl = monthLabels.find(m => m.col === col);
                return (
                  <div key={col} style={{ width: 11, marginRight: 2, flexShrink: 0 }}>
                    {lbl && <span style={{ color: '#5C688C', fontSize: 10, whiteSpace: 'nowrap' }}>{lbl.label}</span>}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-0">
              {/* Day labels */}
              <div className="flex flex-col" style={{ marginRight: 6, width: 26, flexShrink: 0 }}>
                {DAY_LABELS.map((lbl, i) => (
                  <div key={i} style={{ height: 11, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#5C688C', fontSize: 10 }}>{lbl}</span>
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex" style={{ gap: 2 }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: 2 }}>
                    {week.map((day, di) => (
                      <motion.div key={di}
                        style={{
                          width: 11, height: 11, borderRadius: 3,
                          background: day ? LEVEL_COLORS[day.level] : 'rgba(16,21,44,0.4)',
                          boxShadow: day ? LEVEL_GLOW[day.level] : 'none',
                          border: day?.level === 4
                            ? '1px solid rgba(53,228,255,0.5)'
                            : '1px solid rgba(150,162,198,0.05)',
                          flexShrink: 0,
                        }}
                        whileHover={day ? { scale: 1.55, zIndex: 10 } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onMouseEnter={day ? e => handleCellEnter(e, day) : undefined}
                        onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span style={{ color: '#5C688C', fontSize: 10 }}>Less</span>
              {LEVEL_COLORS.map((bg, i) => (
                <div key={i} style={{
                  width: 11, height: 11, borderRadius: 3, background: bg,
                  boxShadow: LEVEL_GLOW[i],
                  border: i === 4 ? '1px solid rgba(53,228,255,0.5)' : '1px solid rgba(150,162,198,0.05)',
                }} />
              ))}
              <span style={{ color: '#5C688C', fontSize: 10 }}>More</span>
            </div>
          </div>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div key="tip"
              initial={{ opacity: 0, y: 4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.92 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                left: tooltip.x, top: tooltip.y,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none', zIndex: 50,
                background: 'rgba(7,10,20,0.95)',
                border: '1px solid rgba(53,228,255,0.28)',
                backdropFilter: 'blur(12px)',
                borderRadius: 8, padding: '6px 12px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 24px rgba(0,0,0,0.7), 0 0 12px rgba(53,228,255,0.1)',
              }}>
              <div className="text-xs font-semibold" style={{ color: tooltip.count > 0 ? '#35E4FF' : '#96A2C6' }}>
                {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
              </div>
              <div className="text-xs" style={{ color: '#5C688C' }}>{tooltip.date}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
