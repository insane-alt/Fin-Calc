"use client";

import { useState, useEffect, useCallback } from "react";
import type { RetirementGoal } from "@/lib/retirement/types";
import { goalSchema, type GoalFormData } from "@/lib/retirement/schemas";
import { requiredMonthlySIP } from "@/lib/retirement/engine";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/retirement/storage";
import {
  formatINR,
  GOAL_PRESETS,
  DEFAULT_PRE_RETIREMENT_RETURN,
} from "@/lib/retirement/constants";
import GoalCard from "../_components/GoalCard";

const emptyForm: GoalFormData = {
  name: "",
  icon: "🎯",
  targetAmount: 1000000,
  targetYear: new Date().getFullYear() + 10,
  currentSaved: 0,
  priority: "medium",
  monthlySIP: 0,
};

type FieldProps = {
  label: string;
  field: keyof GoalFormData;
  prefix?: string;
  suffix?: string;
  type?: string;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  form: GoalFormData;
  errors: Record<string, string>;
  handleChange: (field: keyof GoalFormData, value: string | number) => void;
};

const Field = ({
  label,
  field,
  prefix,
  suffix,
  type = "number",
  help,
  min,
  max,
  step,
  form,
  errors,
  handleChange,
}: FieldProps) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider">
      {label}
    </label>

    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          {prefix}
        </span>
      )}

      <input
        type={type}
        value={form[field] ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border px-3 py-2.5 ml-2"
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {suffix}
        </span>
      )}
    </div>

    {errors[field] && (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    )}
    {help && !errors[field] && <p className="text-xs mt-1">{help}</p>}
  </div>
);

export default function GoalsPage() {
  const [goals, setGoals] = useState<RetirementGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const handleChange = useCallback(
    (field: keyof GoalFormData, value: string | number) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-calculate SIP when target or saved changes
        if (
          field === "targetAmount" ||
          field === "currentSaved" ||
          field === "targetYear"
        ) {
          const yearsLeft = Number(next.targetYear) - new Date().getFullYear();
          const remaining = Math.max(
            0,
            Number(next.targetAmount) - Number(next.currentSaved),
          );
          if (yearsLeft > 0 && remaining > 0) {
            next.monthlySIP = Math.round(
              requiredMonthlySIP(
                remaining,
                DEFAULT_PRE_RETIREMENT_RETURN,
                yearsLeft,
              ),
            );
          }
        }
        return next;
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const applyPreset = useCallback((preset: (typeof GOAL_PRESETS)[0]) => {
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      icon: preset.icon,
      targetAmount: preset.defaultAmount,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const parsed = goalSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0]?.toString() || "form"] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (editingId) {
      const updated = updateGoal(editingId, parsed.data);
      setGoals(updated);
      setEditingId(null);
    } else {
      const newGoal: RetirementGoal = {
        ...parsed.data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = addGoal(newGoal);
      setGoals(updated);
    }

    setForm(emptyForm);
    setShowForm(false);
  }, [form, editingId]);

  const handleEdit = useCallback((goal: RetirementGoal) => {
    setForm({
      name: goal.name,
      icon: goal.icon,
      targetAmount: goal.targetAmount,
      targetYear: goal.targetYear,
      currentSaved: goal.currentSaved,
      priority: goal.priority,
      monthlySIP: goal.monthlySIP,
    });
    setEditingId(goal.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteGoal(id);
    setGoals(updated);
  }, []);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentSaved, 0);
  const totalSIP = goals.reduce((s, g) => s + g.monthlySIP, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Goal Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Track financial goals — education, house, travel, and more.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="shrink-0 py-2.5 px-5 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
        >
          {showForm ? "Cancel" : "+ Add Goal"}
        </button>
      </div>

      {/* Summary cards */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Total Target
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatINR(totalTarget)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Total Saved
            </p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatINR(totalSaved)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Total SIP
            </p>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">
              {formatINR(totalSIP)}/mo
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5">
            {editingId ? "Edit Goal" : "Create New Goal"}
          </h2>

          {/* Presets */}
          <div className="mb-5">
            <p className="text-xs text-slate-400 mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.name === p.name
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Goal Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Dream Home"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Icon
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                maxLength={4}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-2xl px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
            </div>

            <Field
              label="Target Amount"
              field="targetAmount"
              prefix="₹"
              min={10000}
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
            <Field
              label="Target Year"
              field="targetYear"
              min={new Date().getFullYear()}
              max={2080}
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
            <Field
              label="Already Saved"
              field="currentSaved"
              prefix="₹"
              min={0}
              form={form}
              errors={errors}
              handleChange={handleChange}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          {/* Auto-calculated SIP */}
          {form.monthlySIP > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Estimated Monthly SIP
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  To reach {formatINR(form.targetAmount)} by {form.targetYear}{" "}
                  at 12% returns
                </p>
              </div>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatINR(form.monthlySIP)}/mo
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="mt-5 py-2.5 px-8 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
          >
            {editingId ? "Update Goal" : "Add Goal"}
          </button>
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            No goals yet
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Add your first financial goal — emergency fund, child&#39;s
            education, dream home, or anything that matters to you.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={() => handleEdit(g)}
              onDelete={() => handleDelete(g.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
