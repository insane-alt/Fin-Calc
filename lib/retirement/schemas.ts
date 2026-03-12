import { z } from "zod";
import {
    MIN_AGE,
    MAX_AGE,
} from "./constants";

// ─── Calculator Input Schema ─────────────────────────────────────────────────

export const calculatorSchema = z.object({
    currentAge: z.coerce
        .number()
        .min(MIN_AGE, `Must be at least ${MIN_AGE}`)
        .max(MAX_AGE, `Must be at most ${MAX_AGE}`),
    retirementAge: z.coerce.number().min(40).max(75),
    lifeExpectancy: z.coerce.number().min(60).max(100),
    monthlyExpenses: z.coerce.number().min(5000, "Min ₹5,000").max(10000000),
    monthlyIncome: z.coerce.number().min(10000, "Min ₹10,000").max(100000000),
    currentSavings: z.coerce.number().min(0).max(1000000000),
    inflationRate: z.coerce.number().min(1).max(15),
    preRetirementReturn: z.coerce.number().min(1).max(30),
    postRetirementReturn: z.coerce.number().min(1).max(20),
    riskAppetite: z.enum(["conservative", "moderate", "aggressive"]),
}).refine(
    (data) => data.retirementAge > data.currentAge,
    { message: "Retirement age must be greater than current age", path: ["retirementAge"] }
).refine(
    (data) => data.lifeExpectancy > data.retirementAge,
    { message: "Life expectancy must exceed retirement age", path: ["lifeExpectancy"] }
);

export type CalculatorFormData = z.infer<typeof calculatorSchema>;

// ─── Goal Schema ─────────────────────────────────────────────────────────────

export const goalSchema = z.object({
    name: z.string().min(2, "Goal name required").max(50),
    icon: z.string().min(1).max(4),
    targetAmount: z.coerce.number().min(10000, "Min ₹10,000"),
    targetYear: z.coerce
        .number()
        .min(new Date().getFullYear(), "Target year must be in future")
        .max(2080),
    currentSaved: z.coerce.number().min(0),
    priority: z.enum(["critical", "high", "medium", "low"]),
    monthlySIP: z.coerce.number().min(0),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// ─── Snapshot Schema ─────────────────────────────────────────────────────────

export const snapshotSchema = z.object({
    monthlyIncome: z.coerce.number().min(0),
    monthlyExpenses: z.coerce.number().min(0),
    totalSavings: z.coerce.number().min(0),
    totalInvestments: z.coerce.number().min(0),
    notes: z.string().max(500).optional().default(""),
});

export type SnapshotFormData = z.infer<typeof snapshotSchema>;
