import type {
    RetirementGoal,
    AnnualSnapshot,
    CalculationInputs,
    CorpusResult,
} from "./types";

const STORAGE_PREFIX = "nexxt_retirement_";

function getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
        // Storage full or blocked
    }
}

// ─── Calculator Inputs ───────────────────────────────────────────────────────

export function getSavedInputs(): CalculationInputs | null {
    return getItem<CalculationInputs | null>("calc_inputs", null);
}

export function saveInputs(inputs: CalculationInputs): void {
    setItem("calc_inputs", inputs);
}

export function getSavedResult(): CorpusResult | null {
    return getItem<CorpusResult | null>("calc_result", null);
}

export function saveResult(result: CorpusResult): void {
    setItem("calc_result", result);
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function getGoals(): RetirementGoal[] {
    return getItem<RetirementGoal[]>("goals", []);
}

export function saveGoals(goals: RetirementGoal[]): void {
    setItem("goals", goals);
}

export function addGoal(goal: RetirementGoal): RetirementGoal[] {
    const goals = getGoals();
    goals.push(goal);
    saveGoals(goals);
    return goals;
}

export function updateGoal(
    id: string,
    updates: Partial<RetirementGoal>
): RetirementGoal[] {
    const goals = getGoals().map((g) =>
        g.id === id ? { ...g, ...updates } : g
    );
    saveGoals(goals);
    return goals;
}

export function deleteGoal(id: string): RetirementGoal[] {
    const goals = getGoals().filter((g) => g.id !== id);
    saveGoals(goals);
    return goals;
}

// ─── Snapshots ───────────────────────────────────────────────────────────────

export function getSnapshots(): AnnualSnapshot[] {
    return getItem<AnnualSnapshot[]>("snapshots", []);
}

export function saveSnapshots(snapshots: AnnualSnapshot[]): void {
    setItem("snapshots", snapshots);
}

export function addSnapshot(snap: AnnualSnapshot): AnnualSnapshot[] {
    const snaps = getSnapshots();
    snaps.push(snap);
    saveSnapshots(snaps);
    return snaps;
}

export function deleteSnapshot(id: string): AnnualSnapshot[] {
    const snaps = getSnapshots().filter((s) => s.id !== id);
    saveSnapshots(snaps);
    return snaps;
}

// ─── Review Reminder ─────────────────────────────────────────────────────────

export function getNextReviewDate(): string | null {
    return getItem<string | null>("next_review", null);
}

export function setNextReviewDate(date: string): void {
    setItem("next_review", date);
}

export function isReviewOverdue(): boolean {
    const dateStr = getNextReviewDate();
    if (!dateStr) return false;
    return new Date(dateStr) <= new Date();
}
