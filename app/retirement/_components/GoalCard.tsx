"use client";

import type { RetirementGoal } from "@/lib/retirement/types";
import { formatINR } from "@/lib/retirement/constants";

const priorityStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    label: "Critical",
  },
  high: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    label: "High",
  },
  medium: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    label: "Medium",
  },
  low: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    label: "Low",
  },
};

interface GoalCardProps {
  goal: RetirementGoal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const progress = Math.min(100, (goal.currentSaved / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
  const yearsLeft = goal.targetYear - new Date().getFullYear();
  const priority = priorityStyles[goal.priority];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {goal.name}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priority.bg} ${priority.text}`}
            >
              {priority.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              title="Edit goal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
              title="Delete goal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Amount info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs">Target</p>
          <p className="font-bold text-slate-900 dark:text-white">
            {formatINR(goal.targetAmount)}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Saved</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(goal.currentSaved)}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Remaining</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {formatINR(remaining)}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Timeline</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {yearsLeft > 0
              ? `${yearsLeft} yrs (${goal.targetYear})`
              : "This year!"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background:
                progress >= 75
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : progress >= 40
                    ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                    : "linear-gradient(90deg, #f59e0b, #fbbf24)",
            }}
          />
        </div>
        <p className="text-right text-xs font-bold mt-1 text-slate-500 dark:text-slate-400">
          {progress.toFixed(1)}%
        </p>
      </div>

      {/* Monthly SIP */}
      {goal.monthlySIP > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Monthly SIP</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {formatINR(goal.monthlySIP)}/mo
          </span>
        </div>
      )}
    </div>
  );
}
