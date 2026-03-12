"use client";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "emerald" | "blue" | "amber" | "red" | "violet" | "slate";
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-100 dark:border-red-800",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    icon: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-800",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-800/50",
    icon: "text-slate-600 dark:text-slate-400",
    border: "border-slate-100 dark:border-slate-800",
  },
};

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "slate",
}: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        {icon && <div className={`${c.icon}`}>{icon}</div>}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        {trend && trendValue && (
          <span
            className={`text-xs font-bold ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                  ? "text-red-500"
                  : "text-slate-400"
            }`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
