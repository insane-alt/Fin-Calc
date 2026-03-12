"use client";

import { useState, useCallback, useMemo } from "react";
import {
  calculatorSchema,
  type CalculatorFormData,
} from "@/lib/retirement/schemas";
import {
  calculateRetirementCorpus,
  generateYearlyProjection,
} from "@/lib/retirement/engine";
import { generateInvestmentRecommendation } from "@/lib/retirement/investments";
import {
  saveInputs,
  saveResult,
  getSavedInputs,
} from "@/lib/retirement/storage";
import {
  formatINR,
  formatINRFull,
  DEFAULT_INFLATION_RATE,
  DEFAULT_PRE_RETIREMENT_RETURN,
  DEFAULT_POST_RETIREMENT_RETURN,
  DEFAULT_RETIREMENT_AGE,
  DEFAULT_LIFE_EXPECTANCY,
} from "@/lib/retirement/constants";
import type {
  CalculationInputs,
  CorpusResult,
  YearlyProjection,
} from "@/lib/retirement/types";
import CorpusChart from "../_components/CorpusChart";
import AllocationPie from "../_components/AllocationPie";
import StatCard from "../_components/StatCard";

const DEFAULT_FORM: CalculatorFormData = {
  currentAge: 28,
  retirementAge: DEFAULT_RETIREMENT_AGE,
  lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
  monthlyExpenses: 40000,
  monthlyIncome: 100000,
  currentSavings: 300000,
  inflationRate: DEFAULT_INFLATION_RATE,
  preRetirementReturn: DEFAULT_PRE_RETIREMENT_RETURN,
  postRetirementReturn: DEFAULT_POST_RETIREMENT_RETURN,
  riskAppetite: "moderate",
};

type FieldProps = {
  label: string;
  field: keyof CalculatorFormData;
  prefix?: string;
  suffix?: string;
  type?: string;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  form: CalculatorFormData;
  errors: Record<string, string>;
  handleChange: (
    field: keyof CalculatorFormData,
    value: string | number,
  ) => void;
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
        className="w-full rounded-xl border px-3 py-2.5"
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

export default function CalculatorPage() {
  const [form, setForm] = useState<CalculatorFormData>(() => {
    if (typeof window === "undefined") return DEFAULT_FORM;
    const saved = getSavedInputs();
    if (saved) {
      return {
        ...DEFAULT_FORM,
        ...saved,
      };
    }
    return DEFAULT_FORM;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CorpusResult | null>(null);
  const [projections, setProjections] = useState<YearlyProjection[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleChange = useCallback(
    (field: keyof CalculatorFormData, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleCalculate = useCallback(() => {
    const parsed = calculatorSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() || "form";
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const inputs: CalculationInputs = {
      ...parsed.data,
    };

    const corpusResult = calculateRetirementCorpus(inputs);
    const yearlyProjection = generateYearlyProjection(inputs, corpusResult);

    setResult(corpusResult);
    setProjections(yearlyProjection);
    setIsCalculated(true);

    // Persist
    saveInputs(inputs);
    saveResult(corpusResult);
  }, [form]);

  const recommendation = useMemo(() => {
    if (!result) return null;
    return generateInvestmentRecommendation(
      result.monthlySIPRequired,
      form.riskAppetite,
      form.currentAge,
    );
  }, [result, form.riskAppetite, form.currentAge]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Retirement Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Calculate your required retirement corpus using actuarial-grade
          formulas with inflation-adjusted projections.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ─── Input Panel ─────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sticky top-8">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5">
              Your Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Current Age"
                  field="currentAge"
                  suffix="yrs"
                  min={18}
                  max={75}
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                />
                <Field
                  label="Retire At"
                  field="retirementAge"
                  suffix="yrs"
                  min={40}
                  max={75}
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                />
              </div>

              <Field
                label="Life Expectancy"
                field="lifeExpectancy"
                suffix="yrs"
                min={60}
                max={100}
                help="Plan for longevity — 85 is a safe estimate"
                form={form}
                errors={errors}
                handleChange={handleChange}
              />

              <Field
                label="Monthly Expenses"
                field="monthlyExpenses"
                prefix="₹"
                help="Your current total monthly living cost"
                form={form}
                errors={errors}
                handleChange={handleChange}
              />

              <Field
                label="Monthly Income"
                field="monthlyIncome"
                prefix="₹"
                form={form}
                errors={errors}
                handleChange={handleChange}
              />

              <Field
                label="Current Savings"
                field="currentSavings"
                prefix="₹"
                help="Total invested + saved (EPF, FD, MF, etc.)"
                form={form}
                errors={errors}
                handleChange={handleChange}
              />

              {/* Risk appetite */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Risk Appetite
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["conservative", "moderate", "aggressive"] as const).map(
                    (r) => (
                      <button
                        key={r}
                        onClick={() => handleChange("riskAppetite", r)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                          form.riskAppetite === r
                            ? r === "conservative"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30"
                              : r === "moderate"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/30"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500/30"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {showAdvanced ? "▾" : "▸"} Advanced Parameters
              </button>

              {showAdvanced && (
                <div className="space-y-3 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800">
                  <Field
                    label="Inflation Rate"
                    field="inflationRate"
                    suffix="% p.a."
                    min={1}
                    max={15}
                    step={0.5}
                    help="India CPI avg ~6%"
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                  <Field
                    label="Pre-Retirement Return"
                    field="preRetirementReturn"
                    suffix="% p.a."
                    min={4}
                    max={25}
                    step={0.5}
                    help="Expected portfolio return before retirement"
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                  <Field
                    label="Post-Retirement Return"
                    field="postRetirementReturn"
                    suffix="% p.a."
                    min={3}
                    max={15}
                    step={0.5}
                    help="Conservative return in withdrawal phase"
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculate}
              className="w-full mt-6 py-3 px-6 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-300 text-sm tracking-wide"
            >
              Calculate Retirement Corpus
            </button>
          </div>
        </div>

        {/* ─── Results Panel ───────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {!isCalculated ? (
            /* Empty state */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                Enter your details
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Fill in your financial information on the left and hit Calculate
                to see your retirement corpus projection, SIP requirements, and
                investment allocation.
              </p>
            </div>
          ) : result ? (
            <>
              {/* Key metrics */}
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                  label="Required Corpus"
                  value={formatINR(result.requiredCorpus)}
                  subtitle={`At age ${form.retirementAge}`}
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
                  label="Monthly SIP Needed"
                  value={formatINR(result.monthlySIPRequired)}
                  subtitle={`For ${result.yearsToRetirement} years`}
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
                  label="Future Monthly Expense"
                  value={formatINR(result.inflationAdjustedMonthlyExpense)}
                  subtitle={`Today's ₹${form.monthlyExpenses.toLocaleString("en-IN")} in ${result.yearsToRetirement} yrs`}
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
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                />
                <StatCard
                  label="Savings Shortfall"
                  value={
                    result.shortfall > 0 ? formatINR(result.shortfall) : "None!"
                  }
                  subtitle={
                    result.shortfall > 0
                      ? `Current savings grow to ${formatINR(result.projectedSavings)}`
                      : "Your existing savings cover the corpus"
                  }
                  color={result.shortfall > 0 ? "red" : "emerald"}
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
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  }
                />
              </div>

              {/* Projection Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                  Corpus Growth Projection
                </h3>
                <CorpusChart
                  projections={projections}
                  retirementAge={form.retirementAge}
                />
              </div>

              {/* Allocation */}
              {recommendation && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Recommended Allocation
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Based on {form.riskAppetite} risk profile, age{" "}
                        {form.currentAge}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Blended Return</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {recommendation.expectedBlendedReturn}% p.a.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <AllocationPie allocations={recommendation.allocations} />
                    <div className="flex-1 w-full space-y-3">
                      {recommendation.allocations.map((a) => (
                        <div
                          key={a.vehicleId}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-1.5 h-8 rounded-full shrink-0"
                            style={{ backgroundColor: a.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {a.vehicleName}
                              </p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums ml-2">
                                {formatINR(a.monthlyAmount)}
                                <span className="text-xs text-slate-400 font-normal">
                                  /mo
                                </span>
                              </p>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${a.percentage}%`,
                                  backgroundColor: a.color,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Tax saving */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Estimated Tax Saving (30% slab)
                        </p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatINR(recommendation.totalTaxSaving)}/yr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                  Year-by-Year Projection
                </h3>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left py-2 text-slate-400 font-semibold uppercase tracking-wider">
                          Age
                        </th>
                        <th className="text-left py-2 text-slate-400 font-semibold uppercase tracking-wider">
                          Year
                        </th>
                        <th className="text-right py-2 text-slate-400 font-semibold uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="text-right py-2 text-slate-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                          Contribution
                        </th>
                        <th className="text-right py-2 text-slate-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                          Growth
                        </th>
                        <th className="text-center py-2 text-slate-400 font-semibold uppercase tracking-wider">
                          Phase
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projections
                        .filter(
                          (_, i) =>
                            i % 5 === 0 ||
                            projections[i]?.age === form.retirementAge,
                        )
                        .map((p) => (
                          <tr
                            key={p.age}
                            className={`border-b border-slate-50 dark:border-slate-800/50 ${
                              p.age === form.retirementAge
                                ? "bg-emerald-50/50 dark:bg-emerald-900/10"
                                : ""
                            }`}
                          >
                            <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                              {p.age}
                            </td>
                            <td className="py-2 text-slate-500">{p.year}</td>
                            <td className="py-2 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatINR(p.savingsBalance)}
                            </td>
                            <td
                              className={`py-2 text-right tabular-nums hidden sm:table-cell ${
                                p.annualContribution < 0
                                  ? "text-red-500"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {p.annualContribution < 0 ? "-" : "+"}
                              {formatINR(Math.abs(p.annualContribution))}
                            </td>
                            <td className="py-2 text-right text-blue-600 dark:text-blue-400 tabular-nums hidden sm:table-cell">
                              +{formatINR(p.investmentGrowth)}
                            </td>
                            <td className="py-2 text-center">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  p.isRetired
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                }`}
                              >
                                {p.isRetired ? "Retired" : "Saving"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
