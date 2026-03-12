// ============================================================
// FinQuest — Financial Calculation Engine
// Pure functions for all financial math
// ============================================================

import type {
    CompoundInterestParams,
    CompoundInterestResult,
    CreditScoreFactors,
    BudgetAllocation,
    PlayerLevel,
    LEVEL_TITLES,
} from "./types";

// ---- Compound Interest ----

export function calculateCompoundInterest(
    params: CompoundInterestParams
): CompoundInterestResult[] {
    const { principal, monthlyContribution, annualRate, years } = params;
    const monthlyRate = annualRate / 100 / 12;
    const results: CompoundInterestResult[] = [];

    let balance = principal;
    let totalContributed = principal;

    // Year 0
    results.push({
        year: 0,
        totalContributed: principal,
        interestEarned: 0,
        totalValue: principal,
    });

    for (let year = 1; year <= years; year++) {
        for (let month = 0; month < 12; month++) {
            balance = balance * (1 + monthlyRate) + monthlyContribution;
            totalContributed += monthlyContribution;
        }

        results.push({
            year,
            totalContributed: Math.round(totalContributed),
            interestEarned: Math.round(balance - totalContributed),
            totalValue: Math.round(balance),
        });
    }

    return results;
}

// Rule of 72 — estimate years to double money
export function ruleOf72(annualRate: number): number {
    if (annualRate <= 0) return Infinity;
    return Math.round((72 / annualRate) * 10) / 10;
}

// ---- Credit Score Simulator ----

export function calculateCreditScore(factors: CreditScoreFactors): number {
    // FICO-like weighted model
    const weights = {
        paymentHistory: 0.35,
        creditUtilization: 0.30,
        creditAge: 0.15,
        creditMix: 0.10,
        newCredit: 0.10,
    };

    const weightedScore =
        factors.paymentHistory * weights.paymentHistory +
        factors.creditUtilization * weights.creditUtilization +
        factors.creditAge * weights.creditAge +
        factors.creditMix * weights.creditMix +
        factors.newCredit * weights.newCredit;

    // Map 0-100 weighted score to 300-900 CIBIL-like range
    const score = Math.round(300 + (weightedScore / 100) * 600);
    return Math.min(900, Math.max(300, score));
}

export function getCreditRating(score: number): {
    label: string;
    color: string;
    description: string;
} {
    if (score >= 800) return { label: "Excellent", color: "#22c55e", description: "You have an excellent credit profile. Best rates available." };
    if (score >= 740) return { label: "Very Good", color: "#84cc16", description: "Strong credit profile. Eligible for most premium products." };
    if (score >= 670) return { label: "Good", color: "#eab308", description: "Solid credit. Eligible for most financial products." };
    if (score >= 580) return { label: "Fair", color: "#f97316", description: "Some lenders may require additional verification." };
    return { label: "Poor", color: "#ef4444", description: "Limited options. Focus on improving payment history." };
}

// ---- Budget Calculator ----

export function calculateBudget(income: number): BudgetAllocation {
    return {
        needs: 50,
        wants: 30,
        savings: 20,
        income,
    };
}

export function getBudgetAmounts(allocation: BudgetAllocation) {
    const { income, needs, wants, savings } = allocation;
    return {
        needsAmount: Math.round((income * needs) / 100),
        wantsAmount: Math.round((income * wants) / 100),
        savingsAmount: Math.round((income * savings) / 100),
    };
}

// ---- XP & Leveling System ----

// XP required for each level: exponential curve
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
export function getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(50 * Math.pow(level - 1, 1.8));
}

export function getLevelFromXP(totalXP: number): PlayerLevel {
    let level = 1;
    while (level < 30 && getXPForLevel(level + 1) <= totalXP) {
        level++;
    }

    const titles: Record<number, string> = {
        1: "Penny Pincher", 2: "Coin Collector", 3: "Savings Starter",
        4: "Budget Apprentice", 5: "Smart Saver", 6: "Finance Rookie",
        7: "Money Manager", 8: "Budget Warrior", 9: "Investment Scout",
        10: "Portfolio Builder", 11: "Risk Assessor", 12: "Market Watcher",
        13: "Fund Analyst", 14: "Credit Master", 15: "Insurance Expert",
        16: "Diversification Pro", 17: "Compound Crusher", 18: "Wealth Strategist",
        19: "Financial Guru", 20: "Wealth Architect", 21: "Market Oracle",
        22: "Finance Sage", 23: "Economy Titan", 24: "Fiscal Legend",
        25: "Money Maestro", 26: "Capital Commander", 27: "Fortune Forger",
        28: "Prosperity King", 29: "Finance Overlord", 30: "FinQuest Champion",
    };

    return {
        level,
        title: titles[level] || "FinQuest Champion",
        minXP: getXPForLevel(level),
        maxXP: getXPForLevel(level + 1),
    };
}

export function getXPProgress(totalXP: number): {
    level: PlayerLevel;
    currentLevelXP: number;
    requiredLevelXP: number;
    percentage: number;
} {
    const level = getLevelFromXP(totalXP);
    const currentLevelXP = totalXP - level.minXP;
    const requiredLevelXP = level.maxXP - level.minXP;
    const percentage = requiredLevelXP > 0 ? Math.min((currentLevelXP / requiredLevelXP) * 100, 100) : 100;

    return { level, currentLevelXP, requiredLevelXP, percentage };
}

// ---- Quiz Scoring ----

export function calculateQuizScore(
    correctCount: number,
    totalCount: number
): { percentage: number; xpBase: number; grade: string } {
    const percentage = Math.round((correctCount / totalCount) * 100);
    const xpBase = correctCount * 20; // 20 XP per correct answer

    let grade: string;
    if (percentage === 100) grade = "S";
    else if (percentage >= 90) grade = "A";
    else if (percentage >= 75) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 40) grade = "D";
    else grade = "F";

    return { percentage, xpBase, grade };
}

// ---- Streak Multiplier ----

export function getStreakMultiplier(streak: number): number {
    if (streak >= 30) return 3.0;
    if (streak >= 14) return 2.5;
    if (streak >= 7) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
}

export function getStreakLabel(streak: number): string {
    if (streak >= 30) return "🔥 Legendary";
    if (streak >= 14) return "🔥 On Fire";
    if (streak >= 7) return "⚡ Hot Streak";
    if (streak >= 3) return "✨ Building Up";
    return "Start a streak!";
}

// ---- Financial Health Score ----

export function calculateFinancialHealthScore(breakdown: {
    budgeting: number;
    savings: number;
    debt: number;
    insurance: number;
    investment: number;
}): number {
    const weights = {
        budgeting: 0.25,
        savings: 0.25,
        debt: 0.20,
        insurance: 0.15,
        investment: 0.15,
    };

    return Math.round(
        breakdown.budgeting * weights.budgeting +
        breakdown.savings * weights.savings +
        breakdown.debt * weights.debt +
        breakdown.insurance * weights.insurance +
        breakdown.investment * weights.investment
    );
}

export function getHealthLabel(score: number): {
    label: string;
    color: string;
    emoji: string;
} {
    if (score >= 80) return { label: "Excellent", color: "#22c55e", emoji: "🏆" };
    if (score >= 60) return { label: "Good", color: "#84cc16", emoji: "💪" };
    if (score >= 40) return { label: "Fair", color: "#eab308", emoji: "📈" };
    if (score >= 20) return { label: "Needs Work", color: "#f97316", emoji: "⚠️" };
    return { label: "Critical", color: "#ef4444", emoji: "🚨" };
}

// ---- Utility: Format Currency ----

export function formatCurrency(amount: number, locale = "en-IN"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "en-IN" ? "INR" : "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(num: number): string {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}