import type { InvestmentVehicle } from "./types";

// ─── Inflation & Economic Defaults ───────────────────────────────────────────

export const DEFAULT_INFLATION_RATE = 6; // India CPI avg ~6%
export const DEFAULT_PRE_RETIREMENT_RETURN = 12; // Equity-heavy portfolio
export const DEFAULT_POST_RETIREMENT_RETURN = 7; // Debt-heavy post-retirement

// ─── Age Constraints ─────────────────────────────────────────────────────────
export const MIN_AGE = 18;
export const MAX_AGE = 80;
export const DEFAULT_RETIREMENT_AGE = 60;
export const DEFAULT_LIFE_EXPECTANCY = 85;

// ─── Indian Tax Constants (FY 2025-26) ──────────────────────────────────────

export const SECTION_80C_LIMIT = 150000; // ₹1.5 lakh
export const SECTION_80CCD_1B_LIMIT = 50000; // Additional NPS ₹50K
export const LTCG_EXEMPTION = 125000; // ₹1.25 lakh on equity
export const LTCG_TAX_RATE = 12.5; // Above exemption

// ─── Investment Vehicles ─────────────────────────────────────────────────────

export const INVESTMENT_VEHICLES: InvestmentVehicle[] = [
    {
        id: "ppf",
        name: "Public Provident Fund",
        shortName: "PPF",
        expectedReturn: 7.1,
        riskLevel: "low",
        lockInYears: 15,
        taxBenefit: "EEE — Tax-free at invest, growth & withdrawal. Section 80C.",
        maxAnnualInvestment: 150000,
        description:
            "Government-backed, sovereign guarantee. Best for risk-free, long-term, tax-free compounding. 15-year lock-in with partial withdrawals from year 7.",
        color: "#10b981", // emerald
    },
    {
        id: "nps",
        name: "National Pension System",
        shortName: "NPS",
        expectedReturn: 9.5,
        riskLevel: "medium",
        lockInYears: 0, // until 60
        taxBenefit:
            "Extra ₹50K deduction u/s 80CCD(1B) over 80C. 60% lump sum tax-free at maturity.",
        maxAnnualInvestment: null,
        description:
            "Market-linked pension scheme with equity/debt/govt bond allocation. Locked until 60. Excellent for additional tax saving beyond 80C limit.",
        color: "#3b82f6", // blue
    },
    {
        id: "elss",
        name: "ELSS Mutual Funds",
        shortName: "ELSS",
        expectedReturn: 12.5,
        riskLevel: "high",
        lockInYears: 3,
        taxBenefit:
            "Section 80C deduction. LTCG above ₹1.25L taxed at 12.5%. Shortest lock-in among 80C options.",
        maxAnnualInvestment: null,
        description:
            "Equity-linked savings scheme. Highest return potential among tax-saving instruments. 3-year lock-in — shortest in 80C category.",
        color: "#8b5cf6", // violet
    },
    {
        id: "epf",
        name: "Employee Provident Fund",
        shortName: "EPF",
        expectedReturn: 8.25,
        riskLevel: "low",
        lockInYears: 0, // until retirement
        taxBenefit: "EEE status. 12% of basic auto-deducted. Employer matches 12%.",
        maxAnnualInvestment: null,
        description:
            "Mandatory for salaried employees. Employer contribution is free money. Interest rate set by EPFO annually. Withdrawal allowed for specific purposes.",
        color: "#f59e0b", // amber
    },
    {
        id: "mf_equity",
        name: "Equity Mutual Funds",
        shortName: "Equity MF",
        expectedReturn: 13,
        riskLevel: "high",
        lockInYears: 0,
        taxBenefit:
            "No 80C benefit. LTCG above ₹1.25L taxed 12.5% (held >1yr). STCG taxed 20%.",
        maxAnnualInvestment: null,
        description:
            "Diversified equity funds for wealth creation. No lock-in (except ELSS). Best for goals 5+ years away. SIP recommended to average out volatility.",
        color: "#ef4444", // red
    },
    {
        id: "mf_debt",
        name: "Debt Mutual Funds",
        shortName: "Debt MF",
        expectedReturn: 7,
        riskLevel: "low",
        lockInYears: 0,
        taxBenefit: "Taxed at slab rate. No special deduction.",
        maxAnnualInvestment: null,
        description:
            "For stability and capital preservation. Good for short-term goals or post-retirement income. Taxed per income slab since 2023.",
        color: "#64748b", // slate
    },
];

// ─── Risk-based Allocation Templates ─────────────────────────────────────────

export const ALLOCATION_TEMPLATES: Record<
    string,
    Record<string, number>
> = {
    conservative: {
        ppf: 25,
        nps: 15,
        epf: 20,
        elss: 10,
        mf_equity: 10,
        mf_debt: 20,
    },
    moderate: {
        ppf: 15,
        nps: 15,
        epf: 15,
        elss: 20,
        mf_equity: 25,
        mf_debt: 10,
    },
    aggressive: {
        ppf: 10,
        nps: 10,
        epf: 10,
        elss: 25,
        mf_equity: 40,
        mf_debt: 5,
    },
};

// ─── Currency Formatting ─────────────────────────────────────────────────────

export function formatINR(amount: number): string {
    if (amount >= 1e7) {
        const cr = amount / 1e7;
        return `₹${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
    }
    if (amount >= 1e5) {
        const lakh = amount / 1e5;
        return `₹${lakh.toFixed(lakh >= 10 ? 1 : 2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatINRFull(amount: number): string {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ─── Goal Presets ────────────────────────────────────────────────────────────

export const GOAL_PRESETS = [
    { name: "Emergency Fund", icon: "🛡️", defaultAmount: 500000 },
    { name: "Child's Education", icon: "🎓", defaultAmount: 2500000 },
    { name: "Child's Wedding", icon: "💍", defaultAmount: 2000000 },
    { name: "Dream Home", icon: "🏠", defaultAmount: 10000000 },
    { name: "World Travel", icon: "✈️", defaultAmount: 1000000 },
    { name: "New Car", icon: "🚗", defaultAmount: 1500000 },
    { name: "Own Business", icon: "🚀", defaultAmount: 5000000 },
    { name: "Medical Reserve", icon: "🏥", defaultAmount: 1000000 },
];
