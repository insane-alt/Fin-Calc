// ============================================================
// FinQuest — Individual Module Page (Lessons)
// ============================================================

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Brain,
  Lightbulb,
  Lock,
} from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { getModuleBySlug } from "@/lib/finquest/modules-data";
import PageTransition from "@/components/layout/PageTransition";
import ProgressRing from "@/components/ui/ProgressRing";
import type { ModuleSlug } from "@/lib/finquest/types";

const MODULE_COLORS: Record<ModuleSlug, string> = {
  budgeting: "#6c5ce7",
  "compound-interest": "#00cec9",
  insurance: "#fd79a8",
  "mutual-funds": "#fdcb6e",
  "credit-scores": "#e17055",
};

export default function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const completeLesson = useGameStore((s) => s.completeLesson);
  const moduleProgress = useGameStore((s) => s.moduleProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mod = getModuleBySlug(slug);
  if (!mod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-(--foreground-muted)">Module not found</p>
      </div>
    );
  }

  const progress = mounted ? moduleProgress[mod.slug] : null;
  const color = MODULE_COLORS[mod.slug] || "#6c5ce7";
  const completedLessons = progress?.lessonsCompleted || [];
  const totalLessons = mod.lessons.length;
  const pct =
    totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;
  const allLessonsComplete = completedLessons.length === totalLessons;

  const handleLessonComplete = (index: number) => {
    completeLesson(mod.slug, index);
  };

  return (
    <PageTransition>
      <div className="space-y-6 pt-2 pb-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/finquest/modules")}
          className="flex items-center gap-2 text-sm text-(--foreground-muted) hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Modules
        </button>

        {/* Module Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
          style={{
            borderTop: `3px solid ${color}`,
          }}
        >
          <div className="flex items-center gap-4">
            <ProgressRing
              progress={pct}
              size={64}
              strokeWidth={5}
              color={color}
            >
              <span className="text-lg font-bold" style={{ color }}>
                {pct}%
              </span>
            </ProgressRing>
            <div>
              <h1 className="text-xl font-bold">{mod.title}</h1>
              <p className="text-xs text-(--accent-primary-light) font-medium">
                {mod.subtitle}
              </p>
              <p className="text-xs text-(--foreground-muted) mt-1">
                {completedLessons.length}/{totalLessons} lessons •{" "}
                {mod.estimatedMinutes} min
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lesson List */}
        <div className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <BookOpen size={18} style={{ color }} />
            Lessons
          </h2>

          {mod.lessons.map((lesson, i) => {
            const isCompleted = completedLessons.includes(i);
            const isActive = activeLesson === i;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`card p-4 card-interactive ${
                    isActive ? "border-l-4" : ""
                  }`}
                  style={isActive ? { borderLeftColor: color } : {}}
                  onClick={() => setActiveLesson(isActive ? null : i)}
                >
                  {/* Lesson Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {lesson.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-(--foreground-dim) transition-transform shrink-0 ${
                        isActive ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {/* Expanded Lesson Content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                          {/* Content */}
                          <div className="text-sm text-(--foreground-muted)ing-relaxed whitespace-pre-line">
                            {lesson.content}
                          </div>

                          {/* Key Takeaway */}
                          <div
                            className="mt-4 p-3 rounded-lg flex items-start gap-2"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Lightbulb
                              size={16}
                              className="shrink-0 mt-0.5"
                              style={{ color }}
                            />
                            <div>
                              <p
                                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                style={{ color }}
                              >
                                Key Takeaway
                              </p>
                              <p className="text-xs text-foreground">
                                {lesson.keyTakeaway}
                              </p>
                            </div>
                          </div>

                          {/* Complete button */}
                          {!isCompleted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonComplete(i);
                              }}
                              className="btn btn-primary btn-full mt-4"
                              style={{
                                background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                              }}
                            >
                              <CheckCircle2 size={16} />
                              Complete Lesson (+50 XP)
                            </button>
                          )}

                          {isCompleted && (
                            <div className="mt-4 text-center text-xs text-(--accent-success) font-medium flex items-center justify-center gap-1">
                              <CheckCircle2 size={14} />
                              Lesson Completed
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quiz Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Brain size={20} style={{ color }} />
            <h2 className="text-base font-bold">Module Quiz</h2>
          </div>

          {allLessonsComplete ? (
            <>
              <p className="text-sm text-(--foreground-muted) mb-4">
                Test your knowledge! {mod.quiz.length} questions covering
                everything you&apos;ve learned.
              </p>
              {progress?.quizBestScore !== null && (
                <p className="text-xs text-(--foreground-muted) mb-3">
                  Best score:{" "}
                  <span className="font-bold" style={{ color }}>
                    {progress?.quizBestScore}%
                  </span>
                </p>
              )}
              <button
                onClick={() => router.push(`/finquest/modules/${slug}/quiz`)}
                className="btn btn-primary btn-full"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                }}
              >
                <Brain size={16} />
                {progress?.quizCompleted ? "Retake Quiz" : "Start Quiz"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 text-(--foreground-dim)">
              <Lock size={18} />
              <p className="text-sm">
                Complete all {totalLessons} lessons to unlock the quiz
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
