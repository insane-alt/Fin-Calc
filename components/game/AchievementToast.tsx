// ============================================================
// FinQuest — Achievement Toast Component
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { ACHIEVEMENTS } from "@/lib/finquest/achievements";

export default function AchievementToast() {
  const newAchievements = useGameStore((s) => s.newAchievements);
  const clearNewAchievements = useGameStore((s) => s.clearNewAchievements);
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => {
    if (newAchievements.length > 0) {
      setVisible(newAchievements[0]);
      const timer = setTimeout(() => {
        setVisible(null);
        clearNewAchievements();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, clearNewAchievements]);

  const achievement = visible
    ? ACHIEVEMENTS.find((a) => a.id === visible)
    : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-100 mx-auto max-w-100"
        >
          <div className="glass rounded-lg p-4 flex items-center gap-3 border border-(--accent-primary) shadow-(--shadow-glow-primary)">
            <div className="w-10 h-10 rounded-full bg-(--accent-primary) flex items-center justify-center shrink-0">
              <Trophy size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-(--accent-primary-light)">
                Achievement Unlocked!
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {achievement.title}
              </p>
              <p className="text-[10px] text-(--foreground-muted)">
                +{achievement.xpReward} XP
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
