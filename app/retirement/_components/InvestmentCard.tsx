"use client";

import type { InvestmentVehicle } from "@/lib/retirement/types";
import { formatINR } from "@/lib/retirement/constants";

const riskColors = {
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 dark:bg-amber-900/40",
  },
  high: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/40",
  },
};

interface InvestmentCardProps {
  vehicle: InvestmentVehicle;
  allocatedMonthly?: number;
  allocatedAnnual?: number;
}

export default function InvestmentCard({
  vehicle,
  allocatedMonthly,
  allocatedAnnual,
}: InvestmentCardProps) {
  const risk = riskColors[vehicle.riskLevel];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: vehicle.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {vehicle.shortName}
            </h3>
            <p className="text-xs text-slate-400">{vehicle.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black" style={{ color: vehicle.color }}>
              {vehicle.expectedReturn}%
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Expected p.a.
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${risk.badge} ${risk.text}`}
          >
            {vehicle.riskLevel} risk
          </span>
          {vehicle.lockInYears > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {vehicle.lockInYears}yr lock-in
            </span>
          )}
          {vehicle.maxAnnualInvestment && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
              Max {formatINR(vehicle.maxAnnualInvestment)}/yr
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          {vehicle.description}
        </p>

        {/* Tax benefit */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
            Tax Benefit
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {vehicle.taxBenefit}
          </p>
        </div>

        {/* Allocation (if provided) */}
        {allocatedMonthly != null && allocatedMonthly > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400">Your allocation</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {formatINR(allocatedMonthly)}/mo
              </p>
            </div>
            {allocatedAnnual != null && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Annual</p>
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {formatINR(allocatedAnnual)}/yr
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
