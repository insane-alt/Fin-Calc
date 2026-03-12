// ============================================================
// FinQuest — Profile & Achievements Page
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Trophy,
  Flame,
  BookOpen,
  HelpCircle,
  Star,
  RotateCcw,
  ChevronRight,
  Lock,
  Award,
  Zap,
  Heart,
  Calculator,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/finquest/store";
import { ACHIEVEMENTS } from "@/lib/finquest/achievements";
import {
  getXPProgress,
  getStreakLabel,
  getHealthLabel,
} from "@/lib/finquest/financial-engine";
import ProgressRing from "@/components/ui/ProgressRing";
import XPBar from "@/components/ui/XPBar";
import PageTransition from "@/components/layout/PageTransition";

const AVATARS = ["🧑‍🎓", "👩‍💼", "🧑‍💻", "👨‍🚀", "🦸", "🧙"];

// Icon map for achievement icons
const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={18} />,
  Wallet: <Award size={18} />,
  Award: <Award size={18} />,
  Crown: <Trophy size={18} />,
  HelpCircle: <HelpCircle size={18} />,
  Star: <Star size={18} />,
  Swords: <Zap size={18} />,
  Trophy: <Trophy size={18} />,
  Flame: <Flame size={18} />,
  Zap: <Zap size={18} />,
  Heart: <Heart size={18} />,
  Calculator: <Calculator size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Rocket: <TrendingUp size={18} />,
  Gem: <Star size={18} />,
  ChevronUp: <TrendingUp size={18} />,
  ArrowUpCircle: <TrendingUp size={18} />,
  Shield: <Shield size={18} />,
};

type ProfileTab = "stats" | "achievements" | "health";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("stats");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const playerName = useGameStore((s) => s.playerName);
  const avatarIndex = useGameStore((s) => s.avatarIndex);
  const totalXP = useGameStore((s) => s.totalXP);
  const currentStreak = useGameStore((s) => s.currentStreak);
  const longestStreak = useGameStore((s) => s.longestStreak);
  const totalLessonsCompleted = useGameStore((s) => s.totalLessonsCompleted);
  const totalQuizzesCompleted = useGameStore((s) => s.totalQuizzesCompleted);
  const totalPerfectQuizzes = useGameStore((s) => s.totalPerfectQuizzes);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const assessmentCompleted = useGameStore((s) => s.assessmentCompleted);
  const assessmentScore = useGameStore((s) => s.assessmentScore);
  const assessmentBreakdown = useGameStore((s) => s.assessmentBreakdown);
  const moduleProgress = useGameStore((s) => s.moduleProgress);
  const simulatorUsed = useGameStore((s) => s.simulatorUsed);
  const createdAt = useGameStore((s) => s.createdAt);
  const resetProgress = useGameStore((s) => s.resetProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  const xpData = useMemo(() => getXPProgress(totalXP), [totalXP]);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "achievements", label: "Achievements" },
    { id: "health", label: "Health" },
  ];

  if (!mounted) return null;

  const daysSinceJoin = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <PageTransition>
      <div className="space-y-5 pt-2 pb-4">
        {/* Profile Header */}
        <div className="card p-5 text-center">
          <div className="text-5xl mb-2">{AVATARS[avatarIndex] || "🧑‍🎓"}</div>
          <h1 className="text-xl font-bold">{playerName || "Player"}</h1>
          <p className="text-xs text-(--accent-primary) font-medium">
            {xpData.level.title}
          </p>
          <p className="text-[10px] text-(--foreground-muted) mt-1">
            Level {xpData.level.level} · {totalXP.toLocaleString()} XP
          </p>
          <div className="mt-3 max-w-xs mx-auto">
            <XPBar
              percentage={xpData.percentage}
              currentXP={xpData.currentLevelXP}
              requiredXP={xpData.requiredLevelXP}
              level={xpData.level.level}
              title={xpData.level.title}
            />
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 rounded-xl bg-(--background-card)">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-(--accent-primary) text-white"
                  : "text-(--foreground-muted) hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StatsSection
                totalXP={totalXP}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                totalLessonsCompleted={totalLessonsCompleted}
                totalQuizzesCompleted={totalQuizzesCompleted}
                totalPerfectQuizzes={totalPerfectQuizzes}
                unlockedCount={unlockedAchievements.length}
                simulatorUsed={simulatorUsed}
                moduleProgress={moduleProgress}
                daysSinceJoin={daysSinceJoin}
              />
            </motion.div>
          )}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AchievementsSection
                unlockedAchievements={unlockedAchievements}
              />
            </motion.div>
          )}
          {activeTab === "health" && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HealthSection
                assessmentCompleted={assessmentCompleted}
                assessmentScore={assessmentScore}
                assessmentBreakdown={assessmentBreakdown}
                onRetake={() =>
                  router.push("/finquest/onboarding?mode=assessment")
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danger Zone */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-(--accent-danger) mb-2">
            Danger Zone
          </h3>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn btn-danger btn-sm w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              Reset All Progress
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-(--foreground-muted)">
                This will erase all your progress, XP, and achievements. This
                cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetProgress();
                    router.push("/finquest/onboarding");
                  }}
                  className="btn btn-danger btn-sm flex-1"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// ============================================================
// Stats Section
// ============================================================

function StatsSection({
  totalXP,
  currentStreak,
  longestStreak,
  totalLessonsCompleted,
  totalQuizzesCompleted,
  totalPerfectQuizzes,
  unlockedCount,
  simulatorUsed,
  moduleProgress,
  daysSinceJoin,
}: {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  totalQuizzesCompleted: number;
  totalPerfectQuizzes: number;
  unlockedCount: number;
  simulatorUsed: boolean;
  moduleProgress: Record<
    string,
    { quizCompleted: boolean; quizBestScore: number | null }
  >;
  daysSinceJoin: number;
}) {
  const modulesCompleted = Object.values(moduleProgress).filter(
    (m) => m.quizCompleted,
  ).length;
  const averageQuizScore =
    totalQuizzesCompleted > 0
      ? Math.round(
          Object.values(moduleProgress)
            .filter((m) => m.quizBestScore !== null)
            .reduce((sum, m) => sum + (m.quizBestScore || 0), 0) /
            Math.max(
              1,
              Object.values(moduleProgress).filter(
                (m) => m.quizBestScore !== null,
              ).length,
            ),
        )
      : 0;

  const stats = [
    {
      label: "Total XP",
      value: totalXP.toLocaleString(),
      icon: <Star size={16} className="text-(--accent-xp)" />,
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: <Flame size={16} className="text-(--accent-danger)" />,
    },
    {
      label: "Longest Streak",
      value: `${longestStreak} days`,
      icon: <Flame size={16} className="text-orange-400" />,
    },
    {
      label: "Streak Status",
      value: getStreakLabel(currentStreak),
      icon: <Zap size={16} className="text-yellow-400" />,
    },
    {
      label: "Lessons Done",
      value: totalLessonsCompleted.toString(),
      icon: <BookOpen size={16} className="text-blue-400" />,
    },
    {
      label: "Quizzes Done",
      value: totalQuizzesCompleted.toString(),
      icon: <HelpCircle size={16} className="text-purple-400" />,
    },
    {
      label: "Perfect Quizzes",
      value: totalPerfectQuizzes.toString(),
      icon: <Trophy size={16} className="text-yellow-400" />,
    },
    {
      label: "Avg. Quiz Score",
      value: averageQuizScore > 0 ? `${averageQuizScore}%` : "—",
      icon: <TrendingUp size={16} className="text-green-400" />,
    },
    {
      label: "Modules Done",
      value: `${modulesCompleted}/5`,
      icon: <Award size={16} className="text-(--accent-primary)" />,
    },
    {
      label: "Achievements",
      value: `${unlockedCount}/${ACHIEVEMENTS.length}`,
      icon: <Shield size={16} className="text-pink-400" />,
    },
    {
      label: "Simulator Used",
      value: simulatorUsed ? "Yes ✓" : "Not Yet",
      icon: <Calculator size={16} className="text-teal-400" />,
    },
    {
      label: "Days Active",
      value: daysSinceJoin.toString(),
      icon: <User size={16} className="text-(--foreground-muted)" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-3">
          <div className="flex items-center gap-2 mb-1">
            {stat.icon}
            <span className="text-[10px] text-(--foreground-muted) truncate">
              {stat.label}
            </span>
          </div>
          <p className="text-sm font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Achievements Section
// ============================================================

function AchievementsSection({
  unlockedAchievements,
}: {
  unlockedAchievements: string[];
}) {
  const categories: { key: string; label: string }[] = [
    { key: "learning", label: "📚 Learning" },
    { key: "quiz", label: "🧠 Quiz" },
    { key: "streak", label: "🔥 Streak" },
    { key: "special", label: "⭐ Special" },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-3 text-center">
        <p className="text-xs text-(--foreground-muted)">Unlocked</p>
        <p className="text-2xl font-bold gradient-text-xp">
          {unlockedAchievements.length}
          <span className="text-sm text-(--foreground-muted) font-normal">
            /{ACHIEVEMENTS.length}
          </span>
        </p>
        <div className="mt-2 h-2 rounded-full bg-(--background-elevated) overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-xp))",
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {categories.map((cat) => {
        const catAchievements = ACHIEVEMENTS.filter(
          (a) => a.category === cat.key,
        );
        if (catAchievements.length === 0) return null;

        return (
          <div key={cat.key}>
            <h3 className="text-xs font-bold text-(--foreground-muted) mb-2 px-1">
              {cat.label}
            </h3>
            <div className="space-y-2">
              {catAchievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(
                  achievement.id,
                );
                return (
                  <motion.div
                    key={achievement.id}
                    className={`card p-3 flex items-center gap-3 ${
                      isUnlocked ? "" : "opacity-50"
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isUnlocked ? 1 : 0.5, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? "bg-(--accent-primary)/20 text-(--accent-primary)"
                          : "bg-(--background-elevated) text-(--foreground-muted)"
                      }`}
                    >
                      {isUnlocked ? (
                        iconMap[achievement.icon] || <Star size={18} />
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {achievement.title}
                      </p>
                      <p className="text-[10px] text-(--foreground-muted) truncate">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-(--accent-xp)">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Health Section
// ============================================================

function HealthSection({
  assessmentCompleted,
  assessmentScore,
  assessmentBreakdown,
  onRetake,
}: {
  assessmentCompleted: boolean;
  assessmentScore: number | null;
  assessmentBreakdown: {
    budgeting: number;
    savings: number;
    debt: number;
    insurance: number;
    investment: number;
  } | null;
  onRetake: () => void;
}) {
  if (
    !assessmentCompleted ||
    !assessmentBreakdown ||
    assessmentScore === null
  ) {
    return (
      <div className="card p-6 text-center">
        <Heart size={40} className="mx-auto text-(--accent-danger) mb-3" />
        <h3 className="text-base font-bold mb-2">
          Financial Health Assessment
        </h3>
        <p className="text-xs text-(--foreground-muted) mb-4">
          Take the assessment to see your financial health breakdown.
        </p>
        <button onClick={onRetake} className="btn btn-primary btn-md">
          Take Assessment
        </button>
      </div>
    );
  }

  const health = getHealthLabel(assessmentScore);
  const dimensions = [
    { key: "budgeting" as const, label: "Budgeting", color: "#6c5ce7" },
    { key: "savings" as const, label: "Savings", color: "#00cec9" },
    { key: "debt" as const, label: "Debt Mgmt", color: "#fd79a8" },
    { key: "insurance" as const, label: "Insurance", color: "#fdcb6e" },
    { key: "investment" as const, label: "Investment", color: "#e17055" },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="card p-6 text-center">
        <p className="text-xs text-(--foreground-muted) mb-2">
          Overall Financial Health
        </p>
        <div className="flex items-center justify-center mb-2">
          <ProgressRing
            progress={assessmentScore}
            size={100}
            strokeWidth={8}
            color={health.color}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: health.color }}
            >
              {assessmentScore}
            </span>
          </ProgressRing>
        </div>
        <p className="text-lg font-bold" style={{ color: health.color }}>
          {health.emoji} {health.label}
        </p>
      </div>

      {/* Dimension Breakdown */}
      <div className="space-y-3">
        {dimensions.map((dim) => {
          const score = assessmentBreakdown[dim.key];
          return (
            <div key={dim.key} className="card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{dim.label}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: dim.color }}
                >
                  {score}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-(--background-elevated) overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: dim.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Retake Button */}
      <button
        onClick={onRetake}
        className="btn btn-secondary btn-md w-full flex items-center justify-center gap-2"
      >
        <RotateCcw size={14} />
        Retake Assessment
      </button>
    </div>
  );
}
