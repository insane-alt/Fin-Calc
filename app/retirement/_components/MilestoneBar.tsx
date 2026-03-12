"use client";

interface MilestoneBarProps {
  current: number; // current value
  target: number; // target value
  milestones?: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export default function MilestoneBar({
  current,
  target,
  milestones = [],
  color = "#10b981",
  height = 16,
}: MilestoneBarProps) {
  const pct = Math.min(100, (current / target) * 100);

  return (
    <div className="w-full">
      <div
        className="relative bg-slate-100 dark:bg-slate-800 rounded-full overflow-visible"
        style={{ height }}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />

        {/* Milestones */}
        {milestones.map((m, i) => {
          const mPct = Math.min(100, (m.value / target) * 100);
          return (
            <div
              key={i}
              className="absolute top-0"
              style={{ left: `${mPct}%` }}
            >
              <div
                className="w-0.5 bg-slate-400 dark:bg-slate-500"
                style={{ height: height + 8, marginTop: -4 }}
              />
              <p className="text-[9px] text-slate-400 whitespace-nowrap mt-1 -translate-x-1/2">
                {m.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{pct.toFixed(1)}% complete</span>
      </div>
    </div>
  );
}
