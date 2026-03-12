// ============================================================
// FinQuest — XP Bar Component
// ============================================================

"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  percentage: number;
  currentXP: number;
  requiredXP: number;
  level: number;
  title: string;
  compact?: boolean;
}

export default function XPBar({
  percentage,
  currentXP,
  requiredXP,
  level,
  title,
  compact = false,
}: XPBarProps) {
  if (compact) {
    return (
      <div className="w-full">
        <div className="xp-bar-track">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold gradient-text-xp">
            LVL {level}
          </span>
          <span className="text-[10px] text-(--foreground-muted)">{title}</span>
        </div>
        <span className="text-[10px] text-(--foreground-dim) font-mono">
          {currentXP}/{requiredXP} XP
        </span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
