'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitCommit, Flame, Trophy, Calendar } from 'lucide-react';

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
  'rgba(255, 255, 255, 0.04)',
  'rgba(16, 185, 129, 0.25)',
  'rgba(16, 185, 129, 0.50)',
  'rgba(16, 185, 129, 0.78)',
  '#10b981',
];

const LEVEL_GLOW = [
  'none',
  'none',
  '0 0 6px rgba(16, 185, 129, 0.3)',
  '0 0 10px rgba(16, 185, 129, 0.5)',
  '0 0 14px rgba(16, 185, 129, 0.8)',
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildWeeks(contributions: ContributionDay[]): (ContributionDay | null)[][] {
  if (!contributions.length) return [];
  const firstDate = new Date(contributions[0].date);
  const startDow = firstDate.getDay();
  const weeks: (ContributionDay | null)[][] = [];
  let currentWeek: (ContributionDay | null)[] = Array(startDow).fill(null);

  for (const day of contributions) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getMonthLabels(weeks: (ContributionDay | null)[][]) {
  const labels: { name: string; col: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, colIndex) => {
    const firstValidDay = week.find(Boolean);
    if (firstValidDay) {
      const month = new Date(firstValidDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ name: MONTH_NAMES[month], col: colIndex });
        lastMonth = month;
      }
    }
  });

  return labels;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GitHubHeatmap({ username }: { username: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(false);

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last&_t=${Date.now()}`, {
      cache: 'no-store',
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch GitHub contributions');
        return r.json();
      })
      .then((d) => {
        if (!isCancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [username]);

  const weeks = data ? buildWeeks(data.contributions) : [];
  const monthLabels = getMonthLabels(weeks);
  const totalCommits = data?.total?.lastYear ?? 0;
  const contributions = data?.contributions ?? [];

  // Metrics calculation
  const activeDays = contributions.filter((d) => d.count > 0).length;
  const peakDay = contributions.reduce((max, d) => (d.count > max ? d.count : max), 0);

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) {
      currentStreak++;
    } else if (i === contributions.length - 1) {
      continue;
    } else {
      break;
    }
  }

  for (const d of contributions) {
    if (d.count > 0) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  function handleCellEnter(e: React.MouseEvent, day: ContributionDay) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parent = containerRef.current?.getBoundingClientRect();
    if (!parent) return;

    setTooltip({
      visible: true,
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top - 8,
      date: formatDate(day.date),
      count: day.count,
    });
  }

  return (
    <div className="w-full">
      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <GitCommit className="w-3.5 h-3.5" /> Live GitHub Activity
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: '#f1f0ff' }}>
            Contribution <span className="gradient-text">Graph</span>
          </h2>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm mt-1.5 inline-flex items-center gap-1.5 font-medium transition-colors opacity-80 hover:opacity-100"
            style={{ color: '#10b981', textDecoration: 'none' }}
          >
            @{username} ↗
          </a>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            { label: 'Commits', value: loading ? '—' : totalCommits, icon: GitCommit, color: '#10b981' },
            { label: 'Active Days', value: loading ? '—' : activeDays, icon: Calendar, color: '#35E4FF' },
            { label: 'Longest Streak', value: loading ? '—' : `${maxStreak}d`, icon: Trophy, color: '#f7c948' },
            { label: 'Peak Day', value: loading ? '—' : `${peakDay}`, icon: Flame, color: '#ef4444' },
          ].map(({ label, value, icon: IconComp, color }) => (
            <div
              key={label}
              className="p-3 sm:p-4 rounded-xl flex flex-col gap-1 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}25`,
                boxShadow: `0 0 20px ${color}10`,
              }}
            >
              <div className="flex items-center justify-between text-xs font-medium" style={{ color: '#9290b0' }}>
                <span>{label}</span>
                <IconComp className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="text-lg sm:text-2xl font-black" style={{ color: '#f1f0ff' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div
        ref={containerRef}
        className="relative p-5 sm:p-7 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(10,10,26,0.9) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 40px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 stroke-emerald-500 border-t-emerald-500 animate-spin" />
            <span className="text-xs font-medium text-emerald-400">Loading GitHub Graph...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-14 text-sm font-medium text-zinc-400">
            Could not load GitHub contributions for <span className="text-emerald-400">@{username}</span>
          </div>
        )}

        {!loading && !error && data && (
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <div style={{ minWidth: 720 }}>
              {/* Month Header Labels */}
              <div className="flex mb-2 text-[11px] font-medium" style={{ paddingLeft: 30, color: '#9290b0' }}>
                {monthLabels.map((m, i) => (
                  <div key={i} style={{ position: 'relative', left: m.col * 14, marginRight: -20, whiteSpace: 'nowrap' }}>
                    {m.name}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="flex gap-2">
                {/* Day Labels Column */}
                <div className="flex flex-col justify-between text-[10px] font-medium py-0.5" style={{ color: '#9290b0', width: 22, flexShrink: 0 }}>
                  {DAY_LABELS.map((lbl, idx) => (
                    <span key={idx} className="h-3 leading-3">{lbl}</span>
                  ))}
                </div>

                {/* Contribution Cells */}
                <div className="flex gap-1 flex-1">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => (
                        <motion.div
                          key={dIdx}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: day ? LEVEL_COLORS[day.level] : 'rgba(255,255,255,0.04)',
                            boxShadow: day ? LEVEL_GLOW[day.level] : 'none',
                            border: day?.level === 4
                              ? '1px solid rgba(16,185,129,0.9)'
                              : '1px solid rgba(255,255,255,0.06)',
                            cursor: day ? 'pointer' : 'default',
                          }}
                          whileHover={day ? { scale: 1.5, zIndex: 20 } : {}}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          onMouseEnter={day ? (e) => handleCellEnter(e, day) : undefined}
                          onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Legend */}
              <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-zinc-400 font-medium">
                  Showing <strong className="text-emerald-400 font-semibold">{totalCommits}</strong> contributions in the last year
                </span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Less</span>
                  {LEVEL_COLORS.map((bg, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 3,
                        background: bg,
                        boxShadow: LEVEL_GLOW[idx],
                        border: idx === 4 ? '1px solid rgba(16,185,129,0.9)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                zIndex: 50,
                background: 'rgba(10,14,28,0.95)',
                border: '1px solid rgba(16,185,129,0.4)',
                backdropFilter: 'blur(12px)',
                borderRadius: 8,
                padding: '6px 12px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(16,185,129,0.2)',
              }}
            >
              <div className="text-xs font-bold" style={{ color: tooltip.count > 0 ? '#10b981' : '#96A2C6' }}>
                {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
              </div>
              <div className="text-[11px]" style={{ color: '#9290b0' }}>{tooltip.date}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
