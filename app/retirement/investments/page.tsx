"use client";

import { useState, useMemo, useEffect } from "react";
import { INVESTMENT_VEHICLES, formatINR } from "@/lib/retirement/constants";
import { generateInvestmentRecommendation } from "@/lib/retirement/investments";
import { getSavedResult, getSavedInputs } from "@/lib/retirement/storage";
import InvestmentCard from "../_components/InvestmentCard";
import AllocationPie from "../_components/AllocationPie";

export default function InvestmentsPage() {
  const [monthlySIP, setMonthlySIP] = useState(25000);
  const [riskAppetite, setRiskAppetite] = useState<
    "conservative" | "moderate" | "aggressive"
  >("moderate");
  const [age, setAge] = useState(28);

  // Load from saved calculation
  useEffect(() => {
    const savedResult = getSavedResult();
    const savedInputs = getSavedInputs();
    if (savedResult?.monthlySIPRequired) {
      setMonthlySIP(Math.round(savedResult.monthlySIPRequired));
    }
    if (savedInputs) {
      setRiskAppetite(savedInputs.riskAppetite);
      setAge(savedInputs.currentAge);
    }
  }, []);

  const recommendation = useMemo(
    () => generateInvestmentRecommendation(monthlySIP, riskAppetite, age),
    [monthlySIP, riskAppetite, age],
  );

  const allocationMap = useMemo(() => {
    const m: Record<string, { monthly: number; annual: number }> = {};
    for (const a of recommendation.allocations) {
      m[a.vehicleId] = { monthly: a.monthlyAmount, annual: a.annualAmount };
    }
    return m;
  }, [recommendation]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Investment Vehicles
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Explore PPF, NPS, ELSS & Mutual Funds with personalized allocation
          based on your risk profile.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Monthly SIP */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Monthly SIP Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                value={monthlySIP}
                onChange={(e) => setMonthlySIP(Number(e.target.value))}
                min={1000}
                step={1000}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              value={monthlySIP}
              onChange={(e) => setMonthlySIP(Number(e.target.value))}
              min={1000}
              max={500000}
              step={1000}
              className="w-full mt-2 accent-emerald-600"
            />
          </div>

          {/* Risk */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Risk Profile
            </label>
            <div className="space-y-2">
              {(["conservative", "moderate", "aggressive"] as const).map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setRiskAppetite(r)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold capitalize transition-all duration-200 text-left ${
                      riskAppetite === r
                        ? r === "conservative"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30"
                          : r === "moderate"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/30"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500/30"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {r === "conservative" && "🛡️ "}
                    {r === "moderate" && "⚖️ "}
                    {r === "aggressive" && "🚀 "}
                    {r}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Allocation Pie */}
          <div className="flex items-center justify-center">
            <AllocationPie
              allocations={recommendation.allocations}
              size={180}
            />
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Total Monthly
            </p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {formatINR(recommendation.totalMonthlySIP)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Blended Return
            </p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {recommendation.expectedBlendedReturn}% p.a.
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Tax Saved
            </p>
            <p className="text-lg font-black text-violet-600 dark:text-violet-400">
              {formatINR(recommendation.totalTaxSaving)}/yr
            </p>
          </div>
        </div>
      </div>

      {/* Investment Vehicle Cards */}
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
        All Investment Instruments
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INVESTMENT_VEHICLES.map((v) => (
          <InvestmentCard
            key={v.id}
            vehicle={v}
            allocatedMonthly={allocationMap[v.id]?.monthly}
            allocatedAnnual={allocationMap[v.id]?.annual}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5">
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Disclaimer:</strong> Expected returns are based on historical
          performance and are not guaranteed. PPF rate (7.1%) is set by the
          Government of India and revised quarterly. NPS returns vary by fund
          manager and scheme choice. Mutual Fund returns are subject to market
          risk. Tax benefits are under the old tax regime. Consult a SEBI
          registered financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
}
