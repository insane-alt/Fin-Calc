import type { AllocationSplit, InvestmentRecommendation } from "./types";
import {
    INVESTMENT_VEHICLES,
    ALLOCATION_TEMPLATES,
    SECTION_80C_LIMIT,
    SECTION_80CCD_1B_LIMIT,
} from "./constants";
import { calculateTaxSaving } from "./engine";

// ─── Age-Adjusted Allocation ─────────────────────────────────────────────────

/**
 * Adjusts allocation template based on age.
 * Younger investors get more equity; older get more debt.
 * The "100 minus age" rule is applied as a modifier.
 */
function ageAdjustedAllocation(
    baseTemplate: Record<string, number>,
    currentAge: number
): Record<string, number> {
    const equityCapacity = Math.max(20, Math.min(80, 100 - currentAge));
    const currentEquity =
        (baseTemplate.elss || 0) +
        (baseTemplate.mf_equity || 0);
    const currentDebt =
        (baseTemplate.ppf || 0) +
        (baseTemplate.mf_debt || 0);

    if (currentEquity === 0 && currentDebt === 0) return baseTemplate;

    const equityRatio = equityCapacity / 100;
    const debtRatio = 1 - equityRatio;

    // Scale equity and debt instruments proportionally
    const totalEquityDebt = currentEquity + currentDebt;
    const adjusted = { ...baseTemplate };

    // Equity instruments
    if (currentEquity > 0) {
        const equityTarget = totalEquityDebt * equityRatio;
        const eScale = equityTarget / currentEquity;
        if (adjusted.elss !== undefined) adjusted.elss = Math.round((baseTemplate.elss || 0) * eScale);
        if (adjusted.mf_equity !== undefined)
            adjusted.mf_equity = Math.round((baseTemplate.mf_equity || 0) * eScale);
    }

    // Debt instruments
    if (currentDebt > 0) {
        const debtTarget = totalEquityDebt * debtRatio;
        const dScale = debtTarget / currentDebt;
        if (adjusted.ppf !== undefined) adjusted.ppf = Math.round((baseTemplate.ppf || 0) * dScale);
        if (adjusted.mf_debt !== undefined)
            adjusted.mf_debt = Math.round((baseTemplate.mf_debt || 0) * dScale);
    }

    // Normalize to 100%
    const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
    if (total !== 100) {
        const diff = 100 - total;
        adjusted.nps = (adjusted.nps || 0) + diff; // absorb rounding into NPS
    }

    return adjusted;
}

// ─── Generate Investment Recommendation ──────────────────────────────────────

export function generateInvestmentRecommendation(
    monthlySIP: number,
    riskAppetite: "conservative" | "moderate" | "aggressive",
    currentAge: number
): InvestmentRecommendation {
    const baseTemplate = ALLOCATION_TEMPLATES[riskAppetite];
    const adjustedTemplate = ageAdjustedAllocation(baseTemplate, currentAge);

    const allocations: AllocationSplit[] = [];
    let blendedReturn = 0;
    let ppfAnnual = 0;
    let elssAnnual = 0;
    let npsAnnual = 0;
    let epfAnnual = 0;

    for (const vehicle of INVESTMENT_VEHICLES) {
        const pct = adjustedTemplate[vehicle.id] || 0;
        if (pct <= 0) continue;

        const monthlyAmount = Math.round((monthlySIP * pct) / 100);
        const annualAmount = monthlyAmount * 12;

        // Cap PPF at ₹1.5L/year
        const cappedAnnual =
            vehicle.id === "ppf"
                ? Math.min(annualAmount, vehicle.maxAnnualInvestment || Infinity)
                : annualAmount;

        allocations.push({
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            percentage: pct,
            monthlyAmount: Math.round(cappedAnnual / 12),
            annualAmount: cappedAnnual,
            color: vehicle.color,
        });

        blendedReturn += (pct / 100) * vehicle.expectedReturn;

        if (vehicle.id === "ppf") ppfAnnual = cappedAnnual;
        if (vehicle.id === "elss") elssAnnual = cappedAnnual;
        if (vehicle.id === "nps") npsAnnual = cappedAnnual;
        if (vehicle.id === "epf") epfAnnual = cappedAnnual;
    }

    const taxSaving = calculateTaxSaving(
        ppfAnnual,
        elssAnnual,
        npsAnnual,
        epfAnnual
    );

    return {
        allocations,
        totalMonthlySIP: monthlySIP,
        totalAnnualInvestment: monthlySIP * 12,
        expectedBlendedReturn: Math.round(blendedReturn * 100) / 100,
        totalTaxSaving: taxSaving.taxSaved30Percent,
    };
}

// ─── Instrument Details Helper ───────────────────────────────────────────────

export function getVehicleById(id: string) {
    return INVESTMENT_VEHICLES.find((v) => v.id === id);
}

export function getVehiclesByRisk(riskLevel: "low" | "medium" | "high") {
    return INVESTMENT_VEHICLES.filter((v) => v.riskLevel === riskLevel);
}
