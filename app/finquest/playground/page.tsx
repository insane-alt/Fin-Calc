// ============================================================
// FinQuest — Playground (Financial Simulators)
// ============================================================

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  PieChart,
  Star,
  Calculator,
  Wallet,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useGameStore } from "@/lib/finquest/store";
import {
  calculateCompoundInterest,
  calculateCreditScore,
  getCreditRating,
  formatCurrency,
  formatNumber,
  ruleOf72,
} from "@/lib/finquest/financial-engine";
import PageTransition from "@/components/layout/PageTransition";

type SimTab = "compound" | "budget" | "credit";

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<SimTab>("compound");
  const markSimulatorUsed = useGameStore((s) => s.markSimulatorUsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    markSimulatorUsed();
  }, [markSimulatorUsed]);

  const tabs: { id: SimTab; label: string; icon: React.ReactNode }[] = [
    { id: "compound", label: "Compound", icon: <TrendingUp size={16} /> },
    { id: "budget", label: "Budget", icon: <Wallet size={16} /> },
    { id: "credit", label: "Credit", icon: <CreditCard size={16} /> },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 pt-2 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator size={24} className="text-(--accent-secondary)" />
            Playground
          </h1>
          <p className="text-sm text-(--foreground-muted) mt-1">
            Interactive financial simulators
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 rounded-xl bg-(--background-card)">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-(--accent-primary) text-white"
                  : "text-(--foreground-muted) hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {mounted && (
          <>
            {activeTab === "compound" && <CompoundInterestSim />}
            {activeTab === "budget" && <BudgetSim />}
            {activeTab === "credit" && <CreditScoreSim />}
          </>
        )}
      </div>
    </PageTransition>
  );
}

// ============================================================
// Compound Interest Simulator
// ============================================================

function CompoundInterestSim() {
  const [principal, setPrincipal] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);

  const data = useMemo(
    () =>
      calculateCompoundInterest({
        principal,
        monthlyContribution: monthly,
        annualRate: rate,
        years,
      }),
    [principal, monthly, rate, years],
  );

  const finalValue = data[data.length - 1];
  const doublingTime = ruleOf72(rate);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-(--accent-secondary)" />
          Compound Interest Calculator
        </h3>

        {/* Controls */}
        <div className="space-y-4">
          <SliderControl
            label="Initial Investment"
            value={principal}
            onChange={setPrincipal}
            min={0}
            max={5000000}
            step={10000}
            format={(v) => formatCurrency(v)}
          />
          <SliderControl
            label="Monthly Contribution"
            value={monthly}
            onChange={setMonthly}
            min={0}
            max={100000}
            step={1000}
            format={(v) => formatCurrency(v)}
          />
          <SliderControl
            label="Annual Return"
            value={rate}
            onChange={setRate}
            min={1}
            max={25}
            step={0.5}
            format={(v) => `${v}%`}
          />
          <SliderControl
            label="Time Period"
            value={years}
            onChange={setYears}
            min={1}
            max={40}
            step={1}
            format={(v) => `${v} years`}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-[10px] text-(--foreground-muted) mb-1">
            Total Value
          </p>
          <p className="text-sm font-bold gradient-text-success">
            {formatNumber(finalValue.totalValue)}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-(--foreground-muted) mb-1">
            Interest Earned
          </p>
          <p className="text-sm font-bold gradient-text-xp">
            {formatNumber(finalValue.interestEarned)}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-(--foreground-muted) mb-1">
            Doubles In
          </p>
          <p className="text-sm font-bold text-(--accent-warning)">
            {doublingTime} yrs
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4">
        <p className="text-xs font-medium text-(--foreground-muted) mb-3">
          Growth Over Time
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00cec9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00cec9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#5a5a7a" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "#5a5a7a" }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) =>
                value != null ? formatCurrency(value) : ""
              }
            />
            <Area
              type="monotone"
              dataKey="totalContributed"
              stroke="#6c5ce7"
              fill="url(#colorContributed)"
              name="Contributed"
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#00cec9"
              fill="url(#colorValue)"
              name="Total Value"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-(--foreground-muted)">
            <span className="w-2 h-2 rounded-full bg-[#6c5ce7]" /> Contributed
          </span>
          <span className="flex items-center gap-1 text-[10px] text-(--foreground-muted)">
            <span className="w-2 h-2 rounded-full bg-[#00cec9]" /> Total Value
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Budget Simulator
// ============================================================

function BudgetSim() {
  const [income, setIncome] = useState(50000);
  const [needs, setNeeds] = useState(50);
  const [wants, setWants] = useState(30);

  const savings = Math.max(0, 100 - needs - wants);
  const needsAmt = Math.round((income * needs) / 100);
  const wantsAmt = Math.round((income * wants) / 100);
  const savingsAmt = Math.round((income * savings) / 100);

  const PIE_COLORS = ["#6c5ce7", "#fd79a8", "#00b894"];
  const pieData = [
    { name: "Needs", value: needs, amount: needsAmt },
    { name: "Wants", value: wants, amount: wantsAmt },
    { name: "Savings", value: savings, amount: savingsAmt },
  ];

  const isIdeal = needs === 50 && wants === 30 && savings === 20;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-(--accent-primary-light)" />
          Budget Allocator
        </h3>

        <SliderControl
          label="Monthly Income"
          value={income}
          onChange={setIncome}
          min={10000}
          max={500000}
          step={5000}
          format={(v) => formatCurrency(v)}
        />

        <div className="mt-4 space-y-3">
          <SliderControl
            label={`Needs: ${needs}%`}
            value={needs}
            onChange={(v) => {
              setNeeds(v);
              if (v + wants > 100) setWants(100 - v);
            }}
            min={0}
            max={100}
            step={5}
            format={(v) =>
              `${v}% (${formatCurrency(Math.round((income * v) / 100))})`
            }
            color="#6c5ce7"
          />
          <SliderControl
            label={`Wants: ${wants}%`}
            value={wants}
            onChange={(v) => {
              setWants(Math.min(v, 100 - needs));
            }}
            min={0}
            max={100 - needs}
            step={5}
            format={(v) =>
              `${v}% (${formatCurrency(Math.round((income * v) / 100))})`
            }
            color="#fd79a8"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-(--foreground-muted)">
              Savings: {savings}%
            </span>
            <span className="text-sm font-bold text-(--accent-success)">
              {formatCurrency(savingsAmt)}
            </span>
          </div>
        </div>
      </div>

      {/* 50/30/20 comparison */}
      {!isIdeal && (
        <div className="card p-3 border-l-4 border-l-(--accent-warning)">
          <p className="text-xs text-(--accent-warning) font-bold mb-1">
            💡 50/30/20 Rule
          </p>
          <p className="text-[11px] text-(--foreground-muted)">
            The recommended split is 50% needs, 30% wants, 20% savings.
            You&apos;re at {needs}/{wants}/{savings}.
          </p>
        </div>
      )}
      {isIdeal && (
        <div className="card p-3 border-l-4 border-l-(--accent-success)">
          <p className="text-xs text-(--accent-success) font-bold">
            ✅ Perfect 50/30/20 split!
          </p>
        </div>
      )}

      {/* Pie Chart */}
      <div className="card p-4">
        <ResponsiveContainer width="100%" height={220}>
          <RPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: unknown, name: unknown, props: unknown) => {
                const v = typeof value === "number" ? value : 0;
                const p = props as { payload?: { amount?: number } };
                const amount = p?.payload?.amount ?? 0;
                return `${v}% (${formatCurrency(amount)})`;
              }}
            />
          </RPieChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          {pieData.map((d, i) => (
            <span
              key={d.name}
              className="flex items-center gap-1 text-[10px] text-(--foreground-muted)"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: PIE_COLORS[i] }}
              />
              {d.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Credit Score Simulator
// ============================================================

function CreditScoreSim() {
  const [paymentHistory, setPaymentHistory] = useState(80);
  const [creditUtilization, setCreditUtilization] = useState(70);
  const [creditAge, setCreditAge] = useState(50);
  const [creditMix, setCreditMix] = useState(60);
  const [newCredit, setNewCredit] = useState(75);

  const score = useMemo(
    () =>
      calculateCreditScore({
        paymentHistory,
        creditUtilization,
        creditAge,
        creditMix,
        newCredit,
      }),
    [paymentHistory, creditUtilization, creditAge, creditMix, newCredit],
  );

  const rating = getCreditRating(score);

  const factors = [
    {
      label: "Payment History",
      value: paymentHistory,
      onChange: setPaymentHistory,
      weight: "35%",
      color: "#6c5ce7",
    },
    {
      label: "Credit Utilization",
      value: creditUtilization,
      onChange: setCreditUtilization,
      weight: "30%",
      color: "#00cec9",
    },
    {
      label: "Credit Age",
      value: creditAge,
      onChange: setCreditAge,
      weight: "15%",
      color: "#fd79a8",
    },
    {
      label: "Credit Mix",
      value: creditMix,
      onChange: setCreditMix,
      weight: "10%",
      color: "#fdcb6e",
    },
    {
      label: "New Credit",
      value: newCredit,
      onChange: setNewCredit,
      weight: "10%",
      color: "#e17055",
    },
  ];

  const barData = factors.map((f) => ({
    name: f.label.split(" ")[0],
    score: f.value,
    fill: f.color,
  }));

  return (
    <div className="space-y-5">
      {/* Score Display */}
      <motion.div
        className="card p-6 text-center"
        style={{ borderTop: `3px solid ${rating.color}` }}
      >
        <p className="text-xs text-(--foreground-muted) mb-1">
          Your Simulated Credit Score
        </p>
        <motion.p
          key={score}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-5xl font-bold"
          style={{ color: rating.color }}
        >
          {score}
        </motion.p>
        <p className="text-sm font-medium mt-1" style={{ color: rating.color }}>
          {rating.label}
        </p>
        <p className="text-xs text-(--foreground-muted) mt-2 max-w-xs mx-auto">
          {rating.description}
        </p>
      </motion.div>

      {/* Factor Controls */}
      <div className="card p-5">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <Star size={18} className="text-(--accent-warning)" />
          Adjust Factors
        </h3>
        <div className="space-y-4">
          {factors.map((f) => (
            <SliderControl
              key={f.label}
              label={`${f.label} (${f.weight})`}
              value={f.value}
              onChange={f.onChange}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v}/100`}
              color={f.color}
            />
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card p-4">
        <p className="text-xs font-medium text-(--foreground-muted) mb-3">
          Factor Breakdown
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#5a5a7a" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "#5a5a7a" }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================
// Reusable Slider Control
// ============================================================

function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-(--foreground-muted)">{label}</span>
        <span className="text-xs font-bold" style={color ? { color } : {}}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={
          color
            ? ({
                accentColor: color,
              } as React.CSSProperties)
            : {}
        }
      />
    </div>
  );
}
