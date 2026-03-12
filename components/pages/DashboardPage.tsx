// ============================================================
// FinQuest — Dashboard (Hub World)
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  ChevronRight,
  Sparkles,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import {
  getXPProgress,
  getStreakMultiplier,
  getStreakLabel,
} from "@/lib/finquest/financial-engine";
import { GAME_MODULES } from "@/lib/finquest/modules-data";
import ProgressRing from "@/components/ui/ProgressRing";
import XPBar from "@/components/ui/XPBar";
import PageTransition from "@/components/layout/PageTransition";
import type { ModuleSlug } from "@/lib/finquest/types";

const MODULE_COLORS: Record<ModuleSlug, string> = {
  budgeting: "#6c5ce7",
  "compound-interest": "#00cec9",
  insurance: "#fd79a8",
  "mutual-funds": "#fdcb6e",
  "credit-scores": "#e17055",
};

const MODULE_ICONS: Record<ModuleSlug, string> = {
  budgeting: "💰",
  "compound-interest": "📈",
  insurance: "🛡️",
  "mutual-funds": "🎯",
  "credit-scores": "⭐",
};

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const playerName = useGameStore((s) => s.playerName);
  const totalXP = useGameStore((s) => s.totalXP);
  const currentStreak = useGameStore((s) => s.currentStreak);
  const onboardingComplete = useGameStore((s) => s.onboardingComplete);
  const moduleProgress = useGameStore((s) => s.moduleProgress);
  const assessmentCompleted = useGameStore((s) => s.assessmentCompleted);
  const assessmentScore = useGameStore((s) => s.assessmentScore);
  const totalLessonsCompleted = useGameStore((s) => s.totalLessonsCompleted);
  const totalQuizzesCompleted = useGameStore((s) => s.totalQuizzesCompleted);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (mounted && !onboardingComplete) {
      router.push("/finquest/onboarding");
    }
  }, [mounted, onboardingComplete, router]);

  if (!mounted || !onboardingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xpData = getXPProgress(totalXP);
  const streakMultiplier = getStreakMultiplier(currentStreak);
  const streakLabel = getStreakLabel(currentStreak);

  // Calculate overall progress
  const totalModuleLessons = GAME_MODULES.reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );
  const completedLessons = Object.values(moduleProgress).reduce(
    (sum, m) => sum + m.lessonsCompleted.length,
    0,
  );
  const overallProgress =
    totalModuleLessons > 0
      ? Math.round((completedLessons / totalModuleLessons) * 100)
      : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageTransition>
      <div className="space-y-6 pt-2 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-(--foreground-muted) text-sm">
              {getGreeting()},
            </p>
            <h1 className="text-2xl font-bold">
              {playerName || "Explorer"} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(255,107,107,0.15)] border border-[rgba(255,107,107,0.3)]"
              >
                <Flame size={14} className="text-(--accent-danger)" />
                <span className="text-xs font-bold text-(--accent-danger)">
                  {currentStreak}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-4">
            <ProgressRing
              progress={xpData.percentage}
              size={64}
              strokeWidth={5}
              color="#6c5ce7"
            >
              <span className="text-sm font-bold gradient-text">
                {xpData.level.level}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">
                  {xpData.level.title}
                </span>
                {streakMultiplier > 1 && (
                  <span className="badge badge-warning text-[9px]">
                    <Zap size={10} />
                    {streakMultiplier}x XP
                  </span>
                )}
              </div>
              <XPBar
                percentage={xpData.percentage}
                currentXP={xpData.currentLevelXP}
                requiredXP={xpData.requiredLevelXP}
                level={xpData.level.level}
                title={xpData.level.title}
                compact
              />
              <p className="text-[10px] text-(--foreground-dim) mt-1">
                {xpData.currentLevelXP} / {xpData.requiredLevelXP} XP to next
                level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="card p-3 text-center">
            <Flame size={18} className="mx-auto mb-1 text-(--accent-danger)" />
            <p className="text-lg font-bold">{currentStreak}</p>
            <p className="text-[10px] text-(--foreground-muted)">Day Streak</p>
          </div>
          <div className="card p-3 text-center">
            <BookOpen
              size={18}
              className="mx-auto mb-1 text-(--accent-primary-light)"
            />
            <p className="text-lg font-bold">{totalLessonsCompleted}</p>
            <p className="text-[10px] text-(--foreground-muted)">Lessons</p>
          </div>
          <div className="card p-3 text-center">
            <Target
              size={18}
              className="mx-auto mb-1 text-(--accent-secondary)"
            />
            <p className="text-lg font-bold">{totalQuizzesCompleted}</p>
            <p className="text-[10px] text-(--foreground-muted)">Quizzes</p>
          </div>
        </motion.div>

        {/* Financial Health Quick View */}
        {assessmentCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 card-interactive"
            onClick={() => router.push("/finquest/profile")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,184,148,0.15)] flex items-center justify-center">
                  <TrendingUp size={20} className="text-(--accent-success)" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Financial Health</p>
                  <p className="text-xs text-(--foreground-muted)">
                    Score: {assessmentScore}/100
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-(--foreground-dim)" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 card-interactive border-dashed border-(--accent-primary)"
            onClick={() => router.push("/finquest/onboarding?mode=assessment")}
            style={{
              borderStyle: "dashed",
              borderColor: "rgba(108,92,231,0.4)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(108,92,231,0.15)] flex items-center justify-center animate-pulse-glow">
                <Sparkles size={20} className="text-(--accent-primary-light)" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Take Financial Health Assessment
                </p>
                <p className="text-xs text-(--foreground-muted)">
                  Get personalized recommendations • +100 XP
                </p>
              </div>
              <ChevronRight size={18} className="text-(--foreground-dim)" />
            </div>
          </motion.div>
        )}

        {/* Module Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Your Journey</h2>
            <button
              onClick={() => router.push("/finquest/modules")}
              className="text-xs text-(--accent-primary-light) font-medium"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {GAME_MODULES.map((mod, i) => {
              const progress = moduleProgress[mod.slug];
              const totalLessons = mod.lessons.length;
              const completedCount = progress.lessonsCompleted.length;
              const pct =
                totalLessons > 0
                  ? Math.round((completedCount / totalLessons) * 100)
                  : 0;

              return (
                <motion.div
                  key={mod.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="card p-4 card-interactive"
                  onClick={() => router.push(`/finquest/modules/${mod.slug}`)}
                >
                  <div className="flex items-center gap-3">
                    <ProgressRing
                      progress={pct}
                      size={48}
                      strokeWidth={4}
                      color={MODULE_COLORS[mod.slug]}
                    >
                      <span className="text-base">
                        {MODULE_ICONS[mod.slug]}
                      </span>
                    </ProgressRing>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">
                          {mod.title}
                        </p>
                        {progress.quizCompleted && (
                          <span className="badge badge-success text-[9px]">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-(--foreground-muted)">
                        {completedCount}/{totalLessons} lessons
                        {progress.quizBestScore !== null &&
                          ` • Quiz: ${progress.quizBestScore}%`}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-(--foreground-dim) shrink-0"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Achievements Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-4 card-interactive"
          onClick={() => router.push("/finquest/profile")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="text-sm font-semibold">Achievements</p>
                <p className="text-xs text-(--foreground-muted)">
                  {unlockedAchievements.length} unlocked
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-(--foreground-dim)" />
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
