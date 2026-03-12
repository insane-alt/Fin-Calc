// ============================================================
// FinQuest — Onboarding & Assessment Page
// ============================================================

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Heart,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { ASSESSMENT_QUESTIONS } from "@/lib/finquest/assessment-data";
import {
  calculateFinancialHealthScore,
  getHealthLabel,
} from "@/lib/finquest/financial-engine";
import type {
  FinancialDimension,
  FinancialHealthBreakdown,
} from "@/lib/finquest/types";

const AVATARS = ["🦊", "🐯", "🦁", "🐺", "🦅", "🐉", "🦈", "🐬"];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAssessmentOnly = searchParams.get("mode") === "assessment";

  const {
    setPlayerName,
    setAvatarIndex,
    completeOnboarding,
    completeAssessment,
    playerName,
    avatarIndex,
    onboardingComplete,
  } = useGameStore();

  const [step, setStep] = useState<
    "welcome" | "name" | "avatar" | "assessment" | "result"
  >(isAssessmentOnly && onboardingComplete ? "assessment" : "welcome");
  const [name, setName] = useState(playerName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarIndex);
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [breakdown, setBreakdown] = useState<FinancialHealthBreakdown | null>(
    null,
  );
  const [overallScore, setOverallScore] = useState(0);

  const handleNameSubmit = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      setStep("avatar");
    }
  };

  const handleAvatarSubmit = () => {
    setAvatarIndex(selectedAvatar);
    setStep("assessment");
  };

  const handleAssessmentAnswer = (score: number) => {
    const newAnswers = [...assessmentAnswers, score];
    setAssessmentAnswers(newAnswers);

    if (assessmentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentIndex(assessmentIndex + 1);
    } else {
      // Calculate breakdown
      const categoryScores: Record<FinancialDimension, number[]> = {
        budgeting: [],
        savings: [],
        debt: [],
        insurance: [],
        investment: [],
      };

      ASSESSMENT_QUESTIONS.forEach((q, i) => {
        categoryScores[q.category].push(newAnswers[i]);
      });

      const bdData: FinancialHealthBreakdown = {
        budgeting: Math.round(
          categoryScores.budgeting.reduce((a, b) => a + b, 0) /
            categoryScores.budgeting.length,
        ),
        savings: Math.round(
          categoryScores.savings.reduce((a, b) => a + b, 0) /
            categoryScores.savings.length,
        ),
        debt: Math.round(
          categoryScores.debt.reduce((a, b) => a + b, 0) /
            categoryScores.debt.length,
        ),
        insurance: Math.round(
          categoryScores.insurance.reduce((a, b) => a + b, 0) /
            categoryScores.insurance.length,
        ),
        investment: Math.round(
          categoryScores.investment.reduce((a, b) => a + b, 0) /
            categoryScores.investment.length,
        ),
        overall: 0,
      };

      const score = calculateFinancialHealthScore(bdData);
      bdData.overall = score;
      setBreakdown(bdData);
      setOverallScore(score);

      completeAssessment(bdData, score);
      setStep("result");
    }
  };

  const skipAssessment = () => {
    if (!onboardingComplete) {
      completeOnboarding();
    }
    router.push("/finquest");
  };

  const finishOnboarding = () => {
    if (!onboardingComplete) {
      completeOnboarding();
    }
    router.push("/finquest");
  };

  // ---- WELCOME ----
  if (step === "welcome") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          className="text-6xl mb-6"
        >
          💰
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-2"
        >
          <span className="gradient-text">FinQuest</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-(--foreground-muted) mb-8 max-w-xs"
        >
          Master money through play. Learn budgeting, investing, insurance and
          more through interactive lessons.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs space-y-3"
        >
          <button
            onClick={() => setStep("name")}
            className="btn btn-primary btn-lg btn-full"
          >
            Get Started <ArrowRight size={18} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex gap-4 text-[10px] text-(--foreground-dim)"
        >
          <span>5 Modules</span>
          <span>•</span>
          <span>40+ Quizzes</span>
          <span>•</span>
          <span>3 Simulators</span>
        </motion.div>
      </motion.div>
    );
  }

  // ---- NAME ----
  if (step === "name") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <User size={40} className="text-(--accent-primary-light) mb-4" />
        <h2 className="text-xl font-bold mb-2">What should we call you?</h2>
        <p className="text-sm text-(--foreground-muted) mb-8">
          Enter your name or a cool alias
        </p>

        <div className="w-full max-w-xs">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            placeholder="Your name..."
            className="w-full px-4 py-3 rounded-xl bg-(--background-elevated) border border-[rgba(255,255,255,0.1)] text-foreground text-center text-lg font-medium outline-none focus:border-(--accent-primary) transition-colors"
            autoFocus
            maxLength={20}
          />
          <button
            onClick={handleNameSubmit}
            disabled={!name.trim()}
            className="btn btn-primary btn-full mt-4 disabled:opacity-40"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ---- AVATAR ----
  if (step === "avatar") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <h2 className="text-xl font-bold mb-2">Choose your avatar</h2>
        <p className="text-sm text-(--foreground-muted) mb-8">
          Pick a spirit animal for your journey
        </p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {AVATARS.map((avatar, i) => (
            <motion.button
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedAvatar(i)}
              className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                selectedAvatar === i
                  ? "bg-[rgba(108,92,231,0.2)] border-2 border-(--accent-primary) scale-110"
                  : "bg-(--background-elevated) border-2 border-transparent"
              }`}
            >
              {avatar}
            </motion.button>
          ))}
        </div>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={handleAvatarSubmit}
            className="btn btn-primary btn-full"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ---- ASSESSMENT ----
  if (step === "assessment") {
    const q = ASSESSMENT_QUESTIONS[assessmentIndex];
    const progressPct = (assessmentIndex / ASSESSMENT_QUESTIONS.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Heart size={18} className="text-(--accent-danger)" />
              Financial Health Check
            </h2>
            <p className="text-xs text-(--foreground-muted)">
              Question {assessmentIndex + 1} of {ASSESSMENT_QUESTIONS.length}
            </p>
          </div>
          <button
            onClick={skipAssessment}
            className="text-xs text-(--foreground-dim) hover:text-(--foreground-muted)"
          >
            Skip
          </button>
        </div>

        {/* Progress */}
        <div className="xp-bar-track mb-6">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            animate={{ width: `${progressPct}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={assessmentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="text-base font-bold mb-6 leading-relaxed">
              {q.question}
            </p>

            <div className="space-y-3">
              {q.options.map((option, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="answer-card"
                  onClick={() => handleAssessmentAnswer(option.score)}
                >
                  <p className="text-sm">{option.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  // ---- RESULT ----
  if (step === "result" && breakdown) {
    const health = getHealthLabel(overallScore);
    const dimensions = [
      {
        key: "budgeting",
        label: "Budgeting",
        emoji: "💰",
        score: breakdown.budgeting,
      },
      {
        key: "savings",
        label: "Savings",
        emoji: "🏦",
        score: breakdown.savings,
      },
      {
        key: "debt",
        label: "Debt Management",
        emoji: "💳",
        score: breakdown.debt,
      },
      {
        key: "insurance",
        label: "Insurance",
        emoji: "🛡️",
        score: breakdown.insurance,
      },
      {
        key: "investment",
        label: "Investment",
        emoji: "📈",
        score: breakdown.investment,
      },
    ];

    // Find weakest area for recommendation
    const weakest = dimensions.reduce(
      (min, d) => (d.score < min.score ? d : min),
      dimensions[0],
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4 pb-4 space-y-6"
      >
        {/* Score Card */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="card p-6 text-center"
        >
          <p className="text-xs text-(--foreground-muted) mb-2">
            Your Financial Health Score
          </p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
          >
            <p
              className="text-5xl font-bold mb-1"
              style={{ color: health.color }}
            >
              {overallScore}
            </p>
            <p className="text-sm font-medium" style={{ color: health.color }}>
              {health.emoji} {health.label}
            </p>
          </motion.div>
        </motion.div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h3 className="text-base font-bold">Breakdown</h3>
          {dimensions.map((dim, i) => (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span>{dim.emoji}</span> {dim.label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      dim.score >= 70
                        ? "var(--accent-success)"
                        : dim.score >= 40
                          ? "var(--accent-warning)"
                          : "var(--accent-danger)",
                  }}
                >
                  {dim.score}/100
                </span>
              </div>
              <div className="xp-bar-track">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      dim.score >= 70
                        ? "var(--gradient-success)"
                        : dim.score >= 40
                          ? "var(--accent-warning)"
                          : "var(--accent-danger)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.score}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-4 border-l-4 border-l-(--accent-primary)"
        >
          <p className="text-xs font-bold text-(--accent-primary-light) mb-1">
            💡 Recommended First Module
          </p>
          <p className="text-sm text-(--foreground-muted)">
            Based on your scores, start with{" "}
            <strong className="text-foreground">{weakest.label}</strong> to
            strengthen your weakest area.
          </p>
        </motion.div>

        {/* Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <button
            onClick={finishOnboarding}
            className="btn btn-primary btn-lg btn-full"
          >
            <Sparkles size={18} />
            {isAssessmentOnly ? "Back to Dashboard" : "Start Learning!"}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
