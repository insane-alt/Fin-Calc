"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { AnnualSnapshot } from "@/lib/retirement/types";
import {
  snapshotSchema,
  type SnapshotFormData,
} from "@/lib/retirement/schemas";
import {
  getSnapshots,
  addSnapshot,
  deleteSnapshot,
  getNextReviewDate,
  setNextReviewDate,
  getSavedResult,
} from "@/lib/retirement/storage";
import { formatINR } from "@/lib/retirement/constants";
import StatCard from "../_components/StatCard";

const emptyForm: SnapshotFormData = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  totalSavings: 0,
  totalInvestments: 0,
  notes: "",
};

export default function ReviewPage() {
  const [snapshots, setSnapshots] = useState<AnnualSnapshot[]>([]);
  const [nextReview, setNextReview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SnapshotFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSnapshots(getSnapshots());
    setNextReview(getNextReviewDate());
  }, []);

  const isOverdue = useMemo(() => {
    if (!nextReview) return false;
    return new Date(nextReview) <= new Date();
  }, [nextReview]);

  const handleChange = useCallback(
    (field: keyof SnapshotFormData, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const parsed = snapshotSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0]?.toString() || "form"] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const corpusResult = getSavedResult();
    const totalAssets = parsed.data.totalSavings + parsed.data.totalInvestments;
    const progress = corpusResult
      ? Math.min(100, (totalAssets / corpusResult.requiredCorpus) * 100)
      : 0;

    const snap: AnnualSnapshot = {
      id: crypto.randomUUID(),
      year: new Date().getFullYear(),
      date: new Date().toISOString(),
      ...parsed.data,
      notes: parsed.data.notes || "",
      requiredCorpus: corpusResult?.requiredCorpus || 0,
      progressPercent: Math.round(progress * 100) / 100,
    };

    const updated = addSnapshot(snap);
    setSnapshots(updated);

    // Set next review to 1 year from now
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    const nextDateStr = nextDate.toISOString().split("T")[0];
    setNextReviewDate(nextDateStr);
    setNextReview(nextDateStr);

    setForm(emptyForm);
    setShowForm(false);
  }, [form]);

  const handleDeleteSnapshot = useCallback((id: string) => {
    const updated = deleteSnapshot(id);
    setSnapshots(updated);
  }, []);

  const setCustomReviewDate = useCallback((date: string) => {
    setNextReviewDate(date);
    setNextReview(date);
  }, []);

  // Comparison helpers
  const getComparison = (
    current: AnnualSnapshot,
    previous: AnnualSnapshot | undefined,
  ) => {
    if (!previous)
      return {
        incomeChange: 0,
        expenseChange: 0,
        savingsChange: 0,
        progressChange: 0,
      };
    return {
      incomeChange: current.monthlyIncome - previous.monthlyIncome,
      expenseChange: current.monthlyExpenses - previous.monthlyExpenses,
      savingsChange:
        current.totalSavings +
        current.totalInvestments -
        (previous.totalSavings + previous.totalInvestments),
      progressChange: current.progressPercent - previous.progressPercent,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Annual Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Take a yearly snapshot of your finances and track your drift from
            the plan.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 py-2.5 px-5 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
        >
          {showForm ? "Cancel" : "📸 New Snapshot"}
        </button>
      </div>

      {/* Review Reminder */}
      <div
        className={`rounded-2xl p-5 mb-6 border ${
          isOverdue
            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
            : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3
              className={`text-sm font-bold ${
                isOverdue
                  ? "text-red-700 dark:text-red-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {isOverdue ? "⚠ Review Overdue!" : "📅 Next Review"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {nextReview
                ? `Scheduled: ${new Date(nextReview).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`
                : "No review scheduled yet — take your first snapshot!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={nextReview || ""}
              onChange={(e) => setCustomReviewDate(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </div>

      {/* Snapshot form  */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5">
            {new Date().getFullYear()} Financial Snapshot
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                {
                  label: "Monthly Income",
                  field: "monthlyIncome" as const,
                  prefix: "₹",
                },
                {
                  label: "Monthly Expenses",
                  field: "monthlyExpenses" as const,
                  prefix: "₹",
                },
                {
                  label: "Total Savings (FD, Savings)",
                  field: "totalSavings" as const,
                  prefix: "₹",
                },
                {
                  label: "Total Investments (MF, NPS, PPF)",
                  field: "totalInvestments" as const,
                  prefix: "₹",
                },
              ] as const
            ).map(({ label, field, prefix }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                    {prefix}
                  </span>
                  <input
                    type="number"
                    value={form[field] as number}
                    onChange={(e) =>
                      handleChange(field, Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Key changes this year — new job, house bought, market crash, etc."
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="mt-5 py-2.5 px-8 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
          >
            Save Snapshot
          </button>
        </div>
      )}

      {/* Snapshots timeline */}
      {snapshots.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">📸</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            No snapshots yet
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Take your first financial snapshot to start tracking your retirement
            journey year over year.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...snapshots].reverse().map((snap, idx) => {
            const prevSnap = snapshots[snapshots.length - 1 - idx - 1];
            const comp = getComparison(snap, prevSnap);
            const totalAssets = snap.totalSavings + snap.totalInvestments;

            return (
              <div
                key={snap.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {snap.year} Review
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          snap.progressPercent >= 100
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : snap.progressPercent >= 50
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {snap.progressPercent.toFixed(1)}% of corpus
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(snap.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete snapshot"
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
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <StatCard
                    label="Income"
                    value={formatINR(snap.monthlyIncome)}
                    subtitle="/month"
                    color="emerald"
                    trend={
                      comp.incomeChange > 0
                        ? "up"
                        : comp.incomeChange < 0
                          ? "down"
                          : "neutral"
                    }
                    trendValue={
                      comp.incomeChange !== 0
                        ? formatINR(Math.abs(comp.incomeChange))
                        : undefined
                    }
                  />
                  <StatCard
                    label="Expenses"
                    value={formatINR(snap.monthlyExpenses)}
                    subtitle="/month"
                    color="red"
                    trend={
                      comp.expenseChange > 0
                        ? "up"
                        : comp.expenseChange < 0
                          ? "down"
                          : "neutral"
                    }
                    trendValue={
                      comp.expenseChange !== 0
                        ? formatINR(Math.abs(comp.expenseChange))
                        : undefined
                    }
                  />
                  <StatCard
                    label="Net Worth"
                    value={formatINR(totalAssets)}
                    subtitle="savings + investments"
                    color="blue"
                    trend={
                      comp.savingsChange > 0
                        ? "up"
                        : comp.savingsChange < 0
                          ? "down"
                          : "neutral"
                    }
                    trendValue={
                      comp.savingsChange !== 0
                        ? formatINR(Math.abs(comp.savingsChange))
                        : undefined
                    }
                  />
                  <StatCard
                    label="Progress"
                    value={`${snap.progressPercent.toFixed(1)}%`}
                    subtitle={
                      snap.requiredCorpus > 0
                        ? `of ${formatINR(snap.requiredCorpus)}`
                        : ""
                    }
                    color="violet"
                    trend={
                      comp.progressChange > 0
                        ? "up"
                        : comp.progressChange < 0
                          ? "down"
                          : "neutral"
                    }
                    trendValue={
                      comp.progressChange !== 0
                        ? `${Math.abs(comp.progressChange).toFixed(1)}%`
                        : undefined
                    }
                  />
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, snap.progressPercent)}%`,
                      background:
                        snap.progressPercent >= 75
                          ? "linear-gradient(90deg, #10b981, #34d399)"
                          : snap.progressPercent >= 40
                            ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                            : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                    }}
                  />
                </div>

                {/* Notes */}
                {snap.notes && (
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    &ldquo;{snap.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
