// ============================================================
// FinQuest — Module Listing Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Shield,
  BarChart3,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { GAME_MODULES } from "@/lib/finquest/modules-data";
import ProgressRing from "@/components/ui/ProgressRing";
import PageTransition from "@/components/layout/PageTransition";
import type { ModuleSlug } from "@/lib/finquest/types";

const MODULE_COLORS: Record<ModuleSlug, string> = {
  budgeting: "#6c5ce7",
  "compound-interest": "#00cec9",
  insurance: "#fd79a8",
  "mutual-funds": "#fdcb6e",
  "credit-scores": "#e17055",
};

const MODULE_EMOJIS: Record<ModuleSlug, string> = {
  budgeting: "🏙️",
  "compound-interest": "⏳",
  insurance: "🛡️",
  "mutual-funds": "🎯",
  "credit-scores": "⭐",
};

const DIFFICULTY_BADGES: Record<string, { label: string; class: string }> = {
  beginner: { label: "Beginner", class: "badge-success" },
  intermediate: { label: "Intermediate", class: "badge-warning" },
  advanced: { label: "Advanced", class: "badge-danger" },
};

export default function ModulesPage() {
  const router = useRouter();
  const moduleProgress = useGameStore((s) => s.moduleProgress);

  // Count how many modules completed
  const completedModules = Object.values(moduleProgress).filter(
    (m) => m.quizCompleted,
  ).length;

  return (
    <PageTransition>
      <div className="space-y-6 pt-2 pb-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Learning Modules</h1>
          <p className="text-sm text-(--foreground-muted) mt-1">
            {completedModules}/5 worlds conquered
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-xs text-(--foreground-muted)">
              {Math.round((completedModules / 5) * 100)}%
            </span>
          </div>
          <div className="xp-bar-track">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #6c5ce7, #00cec9, #fd79a8, #fdcb6e, #e17055)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedModules / 5) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Module Cards */}
        <div className="space-y-4">
          {GAME_MODULES.map((mod, i) => {
            const progress = moduleProgress[mod.slug];
            const totalLessons = mod.lessons.length;
            const completedCount = progress.lessonsCompleted.length;
            const pct =
              totalLessons > 0
                ? Math.round((completedCount / totalLessons) * 100)
                : 0;
            const difficulty = DIFFICULTY_BADGES[mod.difficulty];

            return (
              <motion.div
                key={mod.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5 card-interactive"
                onClick={() => router.push(`/finquest/modules/${mod.slug}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon & Progress */}
                  <ProgressRing
                    progress={pct}
                    size={56}
                    strokeWidth={4}
                    color={MODULE_COLORS[mod.slug]}
                  >
                    <span className="text-xl">{MODULE_EMOJIS[mod.slug]}</span>
                  </ProgressRing>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold">{mod.title}</h3>
                      {progress.quizCompleted && (
                        <CheckCircle2
                          size={16}
                          className="text-(--accent-success)"
                        />
                      )}
                    </div>
                    <p className="text-xs text-(--accent-primary-light) font-medium mt-0.5">
                      {mod.subtitle}
                    </p>
                    <p className="text-xs text-(--foreground-muted) mt-1 line-clamp-2">
                      {mod.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`badge ${difficulty.class}`}>
                        {difficulty.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-(--foreground-dim)">
                        <Clock size={10} /> {mod.estimatedMinutes} min
                      </span>
                      <span className="text-[10px] text-(--foreground-dim)">
                        {completedCount}/{totalLessons} lessons
                      </span>
                    </div>

                    {/* Quiz Score */}
                    {progress.quizBestScore !== null && (
                      <div className="mt-2 text-[10px]">
                        <span className="text-(--foreground-muted)">
                          Best quiz:{" "}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: MODULE_COLORS[mod.slug] }}
                        >
                          {progress.quizBestScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
