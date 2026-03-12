// ─── Core Financial Types ─────────────────────────────────────────────────────

export interface UserProfile {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    monthlyExpenses: number; // current monthly expenses in ₹
    monthlyIncome: number;
    currentSavings: number;
    riskAppetite: "conservative" | "moderate" | "aggressive";
}

export interface CalculationInputs extends UserProfile {
    inflationRate: number; // e.g. 6 for 6%
    preRetirementReturn: number; // expected annual return before retirement
    postRetirementReturn: number; // expected annual return after retirement
}

export interface CorpusResult {
    requiredCorpus: number;
    inflationAdjustedMonthlyExpense: number;
    inflationAdjustedAnnualExpense: number;
    yearsToRetirement: number;
    yearsInRetirement: number;
    monthlySIPRequired: number;
    shortfall: number; // corpus - FV of current savings
    projectedSavings: number; // FV of current savings at retirement
}

export interface YearlyProjection {
    year: number;
    age: number;
    savingsBalance: number;
    annualContribution: number;
    investmentGrowth: number;
    cumulativeContributions: number;
    targetCorpusAtYear: number;
    isRetired: boolean;
}

// ─── Investment Types ─────────────────────────────────────────────────────────

export interface InvestmentVehicle {
    id: string;
    name: string;
    shortName: string;
    expectedReturn: number; // annual %
    riskLevel: "low" | "medium" | "high";
    lockInYears: number;
    taxBenefit: string;
    maxAnnualInvestment: number | null; // null = no limit
    description: string;
    color: string; // for charts
}

export interface AllocationSplit {
    vehicleId: string;
    vehicleName: string;
    percentage: number;
    monthlyAmount: number;
    annualAmount: number;
    color: string;
}

export interface InvestmentRecommendation {
    allocations: AllocationSplit[];
    totalMonthlySIP: number;
    totalAnnualInvestment: number;
    expectedBlendedReturn: number;
    totalTaxSaving: number;
}

// ─── Goal Types ───────────────────────────────────────────────────────────────

export interface RetirementGoal {
    id: string;
    name: string;
    icon: string; // emoji
    targetAmount: number;
    targetYear: number;
    currentSaved: number;
    priority: "critical" | "high" | "medium" | "low";
    monthlySIP: number;
    createdAt: string;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface AnnualSnapshot {
    id: string;
    year: number;
    date: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalSavings: number;
    totalInvestments: number;
    requiredCorpus: number;
    progressPercent: number;
    notes: string;
}

export interface ReviewComparison {
    current: AnnualSnapshot;
    previous: AnnualSnapshot | null;
    incomeChange: number;
    expenseChange: number;
    savingsChange: number;
    progressChange: number;
    onTrack: boolean;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface RetirementPlan {
    profile: UserProfile;
    calculationInputs: CalculationInputs;
    corpusResult: CorpusResult;
    goals: RetirementGoal[];
    snapshots: AnnualSnapshot[];
    nextReviewDate: string;
    createdAt: string;
    updatedAt: string;
}
