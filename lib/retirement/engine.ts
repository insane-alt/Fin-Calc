import type {
    CalculationInputs,
    CorpusResult,
    YearlyProjection,
} from "./types";

// ─── Core Financial Math ─────────────────────────────────────────────────────

/**
 * Future Value of a lump sum with compound interest
 * FV = PV × (1 + r)^n
 */
export function futureValue(
    principal: number,
    annualRate: number,
    years: number
): number {
    return principal * Math.pow(1 + annualRate / 100, years);
}

/**
 * Inflation-adjusted future cost
 * What today's ₹X will cost in N years
 */
export function inflationAdjusted(
    currentAmount: number,
    inflationRate: number,
    years: number
): number {
    return futureValue(currentAmount, inflationRate, years);
}

/**
 * Present Value of an annuity (series of equal payments)
 * Used to calculate required corpus at retirement
 *
 * PV = PMT × [(1 - (1+r)^-n) / r]
 *
 * Where:
 *  - PMT = annual withdrawal (inflation-adjusted expense at retirement)
 *  - r = real return rate post-retirement (nominal return - inflation)
 *  - n = years in retirement (life expectancy - retirement age)
 */
export function presentValueOfAnnuity(
    annualPayment: number,
    realReturnRate: number,
    years: number
): number {
    if (realReturnRate === 0) return annualPayment * years;
    const r = realReturnRate / 100;
    return annualPayment * ((1 - Math.pow(1 + r, -years)) / r);
}

/**
 * Monthly SIP required to reach a target corpus
 * Using Future Value of Annuity formula solved for PMT
 *
 * FV = PMT × [((1+r)^n - 1) / r]
 * PMT = FV × r / ((1+r)^n - 1)
 *
 * Where r = monthly rate, n = total months
 */
export function requiredMonthlySIP(
    targetAmount: number,
    annualReturn: number,
    years: number
): number {
    if (years <= 0) return targetAmount;
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return targetAmount / months;
    return (
        (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
    );
}

/**
 * Future Value of SIP (monthly investments)
 * FV = PMT × [((1+r)^n - 1) / r] × (1+r)
 */
export function futureValueOfSIP(
    monthlySIP: number,
    annualReturn: number,
    years: number
): number {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlySIP * months;
    return (
        monthlySIP *
        (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
            (1 + monthlyRate))
    );
}

// ─── Main Retirement Corpus Calculator ───────────────────────────────────────

export function calculateRetirementCorpus(
    inputs: CalculationInputs
): CorpusResult {
    const {
        currentAge,
        retirementAge,
        lifeExpectancy,
        monthlyExpenses,
        currentSavings,
        inflationRate,
        preRetirementReturn,
        postRetirementReturn,
    } = inputs;

    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;

    // Step 1: Inflate current monthly expense to retirement year
    const inflationAdjustedMonthlyExpense = inflationAdjusted(
        monthlyExpenses,
        inflationRate,
        yearsToRetirement
    );
    const inflationAdjustedAnnualExpense = inflationAdjustedMonthlyExpense * 12;

    // Step 2: Calculate real return rate during retirement
    // Real return = ((1 + nominal) / (1 + inflation)) - 1
    const realReturnRate =
        (((1 + postRetirementReturn / 100) / (1 + inflationRate / 100)) - 1) * 100;

    // Step 3: Required corpus = PV of annuity of inflation-adjusted expenses
    const requiredCorpus = presentValueOfAnnuity(
        inflationAdjustedAnnualExpense,
        realReturnRate,
        yearsInRetirement
    );

    // Step 4: What will current savings grow to by retirement?
    const projectedSavings = futureValue(
        currentSavings,
        preRetirementReturn,
        yearsToRetirement
    );

    // Step 5: Shortfall = corpus needed - projected savings
    const shortfall = Math.max(0, requiredCorpus - projectedSavings);

    // Step 6: Monthly SIP required to fill the shortfall
    const monthlySIPRequired = requiredMonthlySIP(
        shortfall,
        preRetirementReturn,
        yearsToRetirement
    );

    return {
        requiredCorpus,
        inflationAdjustedMonthlyExpense,
        inflationAdjustedAnnualExpense,
        yearsToRetirement,
        yearsInRetirement,
        monthlySIPRequired,
        shortfall,
        projectedSavings,
    };
}

// ─── Year-by-Year Projection ─────────────────────────────────────────────────

export function generateYearlyProjection(
    inputs: CalculationInputs,
    result: CorpusResult
): YearlyProjection[] {
    const {
        currentAge,
        retirementAge,
        lifeExpectancy,
        currentSavings,
        preRetirementReturn,
        postRetirementReturn,
        inflationRate,
        monthlyExpenses,
    } = inputs;

    const projections: YearlyProjection[] = [];
    let balance = currentSavings;
    let cumulativeContributions = currentSavings;
    const monthlySIP = result.monthlySIPRequired;
    const currentYear = new Date().getFullYear();

    for (let age = currentAge; age <= lifeExpectancy; age++) {
        const yearIndex = age - currentAge;
        const year = currentYear + yearIndex;
        const isRetired = age >= retirementAge;

        if (!isRetired) {
            // Accumulation phase
            const annualContribution = monthlySIP * 12;
            const investmentGrowth = balance * (preRetirementReturn / 100);
            balance = balance + investmentGrowth + annualContribution;
            cumulativeContributions += annualContribution;

            projections.push({
                year,
                age,
                savingsBalance: balance,
                annualContribution,
                investmentGrowth,
                cumulativeContributions,
                targetCorpusAtYear:
                    result.requiredCorpus *
                    (yearIndex / (retirementAge - currentAge)),
                isRetired: false,
            });
        } else {
            // Withdrawal phase
            const yearsPostRetirement = age - retirementAge;
            const annualExpense =
                inflationAdjusted(monthlyExpenses, inflationRate, yearIndex) * 12;
            const investmentGrowth = balance * (postRetirementReturn / 100);
            balance = balance + investmentGrowth - annualExpense;

            projections.push({
                year,
                age,
                savingsBalance: Math.max(0, balance),
                annualContribution: -annualExpense,
                investmentGrowth,
                cumulativeContributions,
                targetCorpusAtYear: result.requiredCorpus,
                isRetired: true,
            });
        }
    }

    return projections;
}

// ─── Tax Saving Calculator ───────────────────────────────────────────────────

export function calculateTaxSaving(
    ppfAnnual: number,
    elssAnnual: number,
    npsAnnual: number,
    epfAnnual: number
): {
    section80C: number;
    section80CCD1B: number;
    totalDeduction: number;
    taxSaved30Percent: number;
} {
    // 80C: PPF + ELSS + EPF capped at ₹1.5L
    const section80C = Math.min(ppfAnnual + elssAnnual + epfAnnual, 150000);
    // 80CCD(1B): NPS extra capped at ₹50K
    const section80CCD1B = Math.min(npsAnnual, 50000);
    const totalDeduction = section80C + section80CCD1B;
    // Assuming 30% tax bracket for illustration
    const taxSaved30Percent = totalDeduction * 0.3;

    return { section80C, section80CCD1B, totalDeduction, taxSaved30Percent };
}
