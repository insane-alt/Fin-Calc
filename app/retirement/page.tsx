"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type {
  CorpusResult,
  RetirementGoal,
  AnnualSnapshot,
  CalculationInputs,
} from "@/lib/retirement/types";
import {
  getSavedResult,
  getSavedInputs,
  getGoals,
  getSnapshots,
  getNextReviewDate,
} from "@/lib/retirement/storage";
import { generateYearlyProjection } from "@/lib/retirement/engine";
import { generateInvestmentRecommendation } from "@/lib/retirement/investments";
import { formatINR } from "@/lib/retirement/constants";
import CorpusChart from "./_components/CorpusChart";
import StatCard from "./_components/StatCard";
import MilestoneBar from "./_components/MilestoneBar";

export default function DashboardPage() {
  const [result, setResult] = useState<CorpusResult | null>(null);
  const [inputs, setInputs] = useState<CalculationInputs | null>(null);
  const [goals, setGoals] = useState<RetirementGoal[]>([]);
  const [snapshots, setSnapshots] = useState<AnnualSnapshot[]>([]);
  const [nextReview, setNextReview] = useState<string | null>(null);

  useEffect(() => {
    setResult(getSavedResult());
    setInputs(getSavedInputs());
    setGoals(getGoals());
    setSnapshots(getSnapshots());
    setNextReview(getNextReviewDate());
  }, []);

  const projections = useMemo(() => {
    if (!inputs || !result) return [];
    return generateYearlyProjection(inputs, result);
  }, [inputs, result]);

  const recommendation = useMemo(() => {
    if (!result || !inputs) return null;
    return generateInvestmentRecommendation(
      result.monthlySIPRequired,
      inputs.riskAppetite,
      inputs.currentAge,
    );
  }, [result, inputs]);

  const isReviewOverdue = useMemo(() => {
    if (!nextReview) return false;
    return new Date(nextReview) <= new Date();
  }, [nextReview]);

  const latestSnapshot = snapshots[snapshots.length - 1];
  const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((s, g) => s + g.currentSaved, 0);

  // ─── No calculation yet: onboarding ────────────────────────────────
  if (!result || !inputs) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-500/30">
            ₹
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            RetireWise
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Pension & Retirement Planning Calculator built for engineers who
            plan their future with the same rigour they ship code.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            {
              icon: "📊",
              title: "Corpus Calculator",
              desc: "Actuarial-grade PV of annuity formula with inflation-adjusted projections",
              href: "/retirement/calculator",
            },
            {
              icon: "📈",
              title: "Investment Allocation",
              desc: "PPF, NPS, ELSS, EPF — age-adjusted allocation with tax saving analysis",
              href: "/retirement/investments",
            },
            {
              icon: "🎯",
              title: "Goal Tracker",
              desc: "Track education, home, travel goals with auto-calculated SIPs",
              href: "/retirement/goals",
            },
            {
              icon: "📸",
              title: "Annual Review",
              desc: "Yearly snapshots with YoY comparison and drift detection",
              href: "/retirement/review",
            },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {f.desc}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/retirement/calculator"
            className="inline-flex items-center gap-2 py-3 px-8 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-sm"
          >
            Start Planning →
          </Link>
        </div>

        {/* Engineering note */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400">
            Zero external chart libraries · Pure SVG visualizations ·
            Zod-validated inputs · Indian tax law aware · localStorage
            persistence
          </p>
        </div>
      </div>
    );
  }

  // ─── Dashboard with data ───────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Your retirement plan at a glance — age {inputs.currentAge}, retiring
            at {inputs.retirementAge}.
          </p>
        </div>
        {/* Review reminder badge */}
        {isReviewOverdue && (
          <Link
            href="/retirement/review"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold animate-pulse"
          >
            ⚠ Review Overdue
          </Link>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Required Corpus"
          value={formatINR(result.requiredCorpus)}
          subtitle={`by age ${inputs.retirementAge}`}
          color="emerald"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
          }
        />
        <StatCard
          label="Monthly SIP"
          value={formatINR(result.monthlySIPRequired)}
          subtitle={`for ${result.yearsToRetirement} years`}
          color="blue"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Years Left"
          value={`${result.yearsToRetirement}`}
          subtitle={`${result.yearsInRetirement} yrs in retirement`}
          color="amber"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Future Monthly Cost"
          value={formatINR(result.inflationAdjustedMonthlyExpense)}
          subtitle={`today's ₹${inputs.monthlyExpenses.toLocaleString("en-IN")}`}
          color="red"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
      </div>

      {/* Corpus progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Corpus Progress
          </h2>
          <Link
            href="/retirement/calculator"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Recalculate →
          </Link>
        </div>
        <MilestoneBar
          current={
            result.projectedSavings > result.requiredCorpus
              ? result.requiredCorpus
              : inputs.currentSavings
          }
          target={result.requiredCorpus}
          milestones={[
            { label: "25%", value: result.requiredCorpus * 0.25 },
            { label: "50%", value: result.requiredCorpus * 0.5 },
            { label: "75%", value: result.requiredCorpus * 0.75 },
          ]}
          color="#10b981"
        />
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Current: {formatINR(inputs.currentSavings)}</span>
          <span>Target: {formatINR(result.requiredCorpus)}</span>
        </div>
      </div>

      {/* Chart + Allocation side by side */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Wealth Projection
          </h2>
          <CorpusChart
            projections={projections}
            retirementAge={inputs.retirementAge}
          />
        </div>

        {recommendation && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Allocation
              </h2>
              <Link
                href="/retirement/investments"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Details →
              </Link>
            </div>
            <div className="space-y-3">
              {recommendation.allocations.map((a) => (
                <div key={a.vehicleId} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 truncate">
                    {a.vehicleName}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                    {a.percentage}%
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {formatINR(a.monthlyAmount)}
                  </span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400">Blended Return</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {recommendation.expectedBlendedReturn}% p.a.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goals + Review preview */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Goals summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Goals ({goals.length})
            </h2>
            <Link
              href="/retirement/goals"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Manage →
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-xs text-slate-400">No goals yet</p>
              <Link
                href="/retirement/goals"
                className="text-xs font-semibold text-emerald-600 mt-2 inline-block hover:underline"
              >
                Add your first goal
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {goals.slice(0, 4).map((g) => {
                  const progress = Math.min(
                    100,
                    (g.currentSaved / g.targetAmount) * 100,
                  );
                  return (
                    <div key={g.id} className="flex items-center gap-3">
                      <span className="text-lg">{g.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {g.name}
                          </p>
                          <p className="text-xs text-slate-400 tabular-nums ml-2">
                            {progress.toFixed(0)}%
                          </p>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              background:
                                progress >= 75
                                  ? "#10b981"
                                  : progress >= 40
                                    ? "#3b82f6"
                                    : "#f59e0b",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalGoalTarget > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {formatINR(totalGoalSaved)} / {formatINR(totalGoalTarget)}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {((totalGoalSaved / totalGoalTarget) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Review preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Annual Review
            </h2>
            <Link
              href="/retirement/review"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All →
            </Link>
          </div>

          {/* Next review */}
          <div
            className={`rounded-xl p-4 mb-4 ${
              isReviewOverdue
                ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
                : "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30"
            }`}
          >
            <p
              className={`text-xs font-bold ${
                isReviewOverdue
                  ? "text-red-700 dark:text-red-400"
                  : "text-blue-700 dark:text-blue-400"
              }`}
            >
              {isReviewOverdue ? "⚠ Review Overdue!" : "📅 Next Review"}
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
              {nextReview
                ? new Date(nextReview).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not scheduled"}
            </p>
          </div>

          {/* Latest snapshot */}
          {latestSnapshot ? (
            <div>
              <p className="text-xs text-slate-400 mb-2">
                Latest snapshot: {latestSnapshot.year}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-slate-400">Net Worth</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {formatINR(
                      latestSnapshot.totalSavings +
                        latestSnapshot.totalInvestments,
                    )}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-slate-400">Progress</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {latestSnapshot.progressPercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📸</p>
              <p className="text-xs text-slate-400">No snapshots yet</p>
              <Link
                href="/retirement/review"
                className="text-xs font-semibold text-emerald-600 mt-2 inline-block hover:underline"
              >
                Take first snapshot
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-xs text-slate-400">
          Built by an engineer · Actuarial-grade formulas · Indian tax law aware
          · Zero external dependencies
        </p>
      </div>
    </div>
  );
}
