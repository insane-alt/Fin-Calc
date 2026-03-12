// ============================================================
// FinQuest — Quiz Page (State Machine based)
// ============================================================

"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Brain,
} from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { getModuleBySlug } from "@/lib/finquest/modules-data";
import { calculateQuizScore } from "@/lib/finquest/financial-engine";
import PageTransition from "@/components/layout/PageTransition";
import type { QuizQuestion, QuizState, ModuleSlug } from "@/lib/finquest/types";

const MODULE_COLORS: Record<ModuleSlug, string> = {
  budgeting: "#6c5ce7",
  "compound-interest": "#00cec9",
  insurance: "#fd79a8",
  "mutual-funds": "#fdcb6e",
  "credit-scores": "#e17055",
};

export default function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const completeQuiz = useGameStore((s) => s.completeQuiz);

  const mod = getModuleBySlug(slug);
  const color = mod
    ? MODULE_COLORS[mod.slug as ModuleSlug] || "#6c5ce7"
    : "#6c5ce7";

  const [quizState, setQuizState] = useState<QuizState>({ status: "idle" });
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(
    null,
  );
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!mod) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-(--foreground-muted)">Module not found</p>
      </div>
    );
  }

  const questions = mod.quiz;

  const startQuiz = () => {
    setQuizState({
      status: "answering",
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
    });
    setSelectedAnswer(null);
    setShowExplanation(false);
    // Init slider to midpoint for first question if slider type
    if (questions[0].type === "slider") {
      setSliderValue(Math.floor((questions[0].min + questions[0].max) / 2));
    }
  };

  const currentQuestion: QuizQuestion | null =
    quizState.status === "answering" || quizState.status === "reviewing"
      ? questions[quizState.currentIndex]
      : null;

  const submitAnswer = () => {
    if (quizState.status !== "answering") return;

    let answer: number | boolean | null = selectedAnswer;
    if (currentQuestion?.type === "slider") {
      answer = sliderValue;
    }

    const newAnswers = [...quizState.answers];
    newAnswers[quizState.currentIndex] = answer;

    setQuizState({
      status: "reviewing",
      currentIndex: quizState.currentIndex,
      answers: newAnswers,
      selectedAnswer: answer,
    });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (quizState.status !== "reviewing") return;

    const nextIndex = quizState.currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Calculate results
      let correctCount = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const a = quizState.answers[i];
        if (isCorrect(q, a)) correctCount++;
      }

      const { percentage, xpBase } = calculateQuizScore(
        correctCount,
        questions.length,
      );

      // Save to store
      completeQuiz(mod.slug, correctCount, questions.length);

      setQuizState({
        status: "complete",
        answers: quizState.answers,
        score: percentage,
        xpEarned: xpBase,
        correctCount,
        totalCount: questions.length,
      });
    } else {
      setQuizState({
        status: "answering",
        currentIndex: nextIndex,
        answers: quizState.answers,
      });
      setSelectedAnswer(null);
      setShowExplanation(false);
      // Init slider for next question
      if (questions[nextIndex].type === "slider") {
        setSliderValue(
          Math.floor((questions[nextIndex].min + questions[nextIndex].max) / 2),
        );
      }
    }
  };

  const isCorrect = (
    q: QuizQuestion,
    answer: number | boolean | null,
  ): boolean => {
    if (answer === null) return false;
    switch (q.type) {
      case "mcq":
        return answer === q.correctIndex;
      case "true-false":
        return answer === q.correctAnswer;
      case "scenario":
        return answer === q.correctIndex;
      case "slider": {
        const diff = Math.abs((answer as number) - q.correctValue);
        const tolerance = (q.max - q.min) * (q.tolerance / 100);
        return diff <= tolerance;
      }
    }
  };

  const isCurrentCorrect = (): boolean => {
    if (quizState.status !== "reviewing" || !currentQuestion) return false;
    return isCorrect(currentQuestion, quizState.selectedAnswer);
  };

  // ---- IDLE STATE ----
  if (quizState.status === "idle") {
    return (
      <PageTransition>
        <div className="space-y-6 pt-2 pb-4">
          <button
            onClick={() => router.push(`/finquest/modules/${slug}`)}
            className="flex items-center gap-2 text-sm text-(--foreground-muted) hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Module
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 text-center"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Brain size={32} style={{ color }} />
            </div>
            <h1 className="text-xl font-bold mb-2">{mod.title} Quiz</h1>
            <p className="text-sm text-(--foreground-muted) mb-1">
              {questions.length} questions • Mixed types
            </p>
            <p className="text-xs text-(--foreground-dim) mb-6">
              MCQ, True/False, Slider & Scenario-based
            </p>

            <button
              onClick={startQuiz}
              className="btn btn-primary btn-lg btn-full"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              }}
            >
              <Sparkles size={18} />
              Start Quiz
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ---- COMPLETE STATE ----
  if (quizState.status === "complete") {
    const { score, xpEarned, correctCount, totalCount } = quizState;
    const isPerfect = score === 100;
    const gradeEmoji =
      score >= 90
        ? "🏆"
        : score >= 75
          ? "🎉"
          : score >= 60
            ? "👍"
            : score >= 40
              ? "📚"
              : "💪";

    return (
      <PageTransition>
        <div className="space-y-6 pt-2 pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 text-center"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 10,
                stiffness: 200,
                delay: 0.2,
              }}
              className="text-5xl mb-4"
            >
              {gradeEmoji}
            </motion.div>

            <h1 className="text-2xl font-bold mb-1">
              {isPerfect
                ? "Perfect Score!"
                : score >= 75
                  ? "Great Job!"
                  : score >= 50
                    ? "Nice Try!"
                    : "Keep Learning!"}
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-6 my-6">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color }}>
                    {score}%
                  </p>
                  <p className="text-[10px] text-(--foreground-muted)">Score</p>
                </div>
                <div className="w-px h-10 bg-[rgba(255,255,255,0.1)]" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-(--accent-success)">
                    {correctCount}/{totalCount}
                  </p>
                  <p className="text-[10px] text-(--foreground-muted)">
                    Correct
                  </p>
                </div>
                <div className="w-px h-10 bg-[rgba(255,255,255,0.1)]" />
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text-xp">
                    +{xpEarned}
                  </p>
                  <p className="text-[10px] text-(--foreground-muted)">
                    XP Earned
                  </p>
                </div>
              </div>

              {isPerfect && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="badge badge-success text-xs px-4 py-2 mb-4"
                >
                  <Trophy size={12} /> Perfectionist Achievement!
                </motion.div>
              )}
            </motion.div>

            <div className="space-y-3 mt-4">
              <button
                onClick={startQuiz}
                className="btn btn-secondary btn-full"
              >
                <RotateCcw size={16} />
                Retake Quiz
              </button>
              <button
                onClick={() => router.push(`/finquest/modules/${slug}`)}
                className="btn btn-primary btn-full"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                }}
              >
                <Home size={16} />
                Back to Modules
              </button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ---- ANSWERING / REVIEWING STATE ----
  const currentIdx = quizState.currentIndex;
  const q = currentQuestion!;
  const isReviewing = quizState.status === "reviewing";
  const progressPct =
    ((currentIdx + (isReviewing ? 1 : 0)) / questions.length) * 100;

  return (
    <PageTransition>
      <div className="space-y-5 pt-2 pb-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-(--foreground-muted)">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs font-mono text-(--foreground-dim)">
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="xp-bar-track">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Type Badge */}
        <div className="flex items-center gap-2">
          <span className="badge badge-primary text-[9px]">
            {q.type === "mcq"
              ? "Multiple Choice"
              : q.type === "true-false"
                ? "True / False"
                : q.type === "slider"
                  ? "Estimation"
                  : "Scenario"}
          </span>
          {q.xpReward && (
            <span className="text-[10px] text-(--foreground-dim)">
              +{q.xpReward} XP
            </span>
          )}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Scenario intro */}
            {q.type === "scenario" && (
              <div
                className="card p-4 mb-4 border-l-4"
                style={{ borderLeftColor: color }}
              >
                <p className="text-xs text-(--accent-primary-light) font-bold uppercase tracking-wider mb-1">
                  Scenario
                </p>
                <p className="text-sm text-(--foreground-muted)">
                  {q.scenario}
                </p>
              </div>
            )}

            <h2 className="text-base font-bold leading-relaxed mb-5">
              {q.question}
            </h2>

            {/* MCQ Options */}
            {q.type === "mcq" && (
              <div className="space-y-3">
                {q.options.map((option, i) => {
                  let cardClass = "answer-card";
                  if (isReviewing) {
                    if (i === q.correctIndex) cardClass += " correct";
                    else if (i === selectedAnswer && i !== q.correctIndex)
                      cardClass += " incorrect";
                  } else if (i === selectedAnswer) {
                    cardClass += " selected";
                  }

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cardClass}
                      onClick={() => !isReviewing && setSelectedAnswer(i)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-[rgba(255,255,255,0.2)] flex items-center justify-center text-xs font-bold shrink-0">
                          {isReviewing && i === q.correctIndex ? (
                            <CheckCircle2
                              size={16}
                              className="text-(--accent-success)"
                            />
                          ) : isReviewing &&
                            i === selectedAnswer &&
                            i !== q.correctIndex ? (
                            <XCircle
                              size={16}
                              className="text-(--accent-danger)"
                            />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </div>
                        <span className="text-sm">{option}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* True/False Options */}
            {q.type === "true-false" && (
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map((val) => {
                  let cardClass = "answer-card text-center";
                  if (isReviewing) {
                    if (val === q.correctAnswer) cardClass += " correct";
                    else if (val === selectedAnswer && val !== q.correctAnswer)
                      cardClass += " incorrect";
                  } else if (val === selectedAnswer) {
                    cardClass += " selected";
                  }

                  return (
                    <div
                      key={String(val)}
                      className={cardClass}
                      onClick={() => !isReviewing && setSelectedAnswer(val)}
                    >
                      <p className="text-lg font-bold mb-1">
                        {val ? "TRUE" : "FALSE"}
                      </p>
                      <p className="text-xs text-(--foreground-muted)">
                        {val ? "✓ Correct" : "✗ Incorrect"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Slider Question */}
            {q.type === "slider" && (
              <div className="space-y-4">
                <div className="text-center">
                  <motion.p
                    key={sliderValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold"
                    style={{ color }}
                  >
                    {q.unit === "₹"
                      ? `₹${sliderValue.toLocaleString()}`
                      : `${sliderValue} ${q.unit}`}
                  </motion.p>
                </div>
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  step={q.step}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  disabled={isReviewing}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-(--foreground-dim)">
                  <span>
                    {q.unit === "₹"
                      ? `₹${q.min.toLocaleString()}`
                      : `${q.min} ${q.unit}`}
                  </span>
                  <span>
                    {q.unit === "₹"
                      ? `₹${q.max.toLocaleString()}`
                      : `${q.max} ${q.unit}`}
                  </span>
                </div>
                {isReviewing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm"
                  >
                    Correct answer:{" "}
                    <span className="font-bold text-(--accent-success)">
                      {q.unit === "₹"
                        ? `₹${q.correctValue.toLocaleString()}`
                        : `${q.correctValue} ${q.unit}`}
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Scenario Options */}
            {q.type === "scenario" && (
              <div className="space-y-3">
                {q.options.map((option, i) => {
                  let cardClass = "answer-card";
                  if (isReviewing) {
                    if (i === q.correctIndex) cardClass += " correct";
                    else if (i === selectedAnswer && i !== q.correctIndex)
                      cardClass += " incorrect";
                  } else if (i === selectedAnswer) {
                    cardClass += " selected";
                  }

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cardClass}
                      onClick={() => !isReviewing && setSelectedAnswer(i)}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {option.label}
                      </p>
                      <p className="text-xs text-(--foreground-muted)">
                        {option.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {isReviewing && showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5"
                >
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: isCurrentCorrect()
                        ? "rgba(0,184,148,0.1)"
                        : "rgba(255,107,107,0.1)",
                      borderLeft: `3px solid ${isCurrentCorrect() ? "var(--accent-success)" : "var(--accent-danger)"}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCurrentCorrect() ? (
                        <CheckCircle2
                          size={16}
                          className="text-(--accent-success)"
                        />
                      ) : (
                        <XCircle size={16} className="text-(--accent-danger)" />
                      )}
                      <span className="text-sm font-bold">
                        {isCurrentCorrect() ? "Correct!" : "Not quite!"}
                      </span>
                    </div>
                    <p className="text-xs text-(--foreground-muted) leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="pt-2">
          {!isReviewing ? (
            <button
              onClick={submitAnswer}
              disabled={selectedAnswer === null && q.type !== "slider"}
              className="btn btn-primary btn-full disabled:opacity-40"
              style={{
                background:
                  selectedAnswer === null && q.type !== "slider"
                    ? "var(--background-elevated)"
                    : `linear-gradient(135deg, ${color}, ${color}aa)`,
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="btn btn-primary btn-full"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              }}
            >
              {currentIdx < questions.length - 1 ? (
                <>
                  Next Question <ArrowRight size={16} />
                </>
              ) : (
                <>
                  See Results <Trophy size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
