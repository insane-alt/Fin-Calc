// ============================================================
// FinQuest — Core Type System
// ============================================================

// ---- Module & Lesson Types ----

export type ModuleSlug =
    | "budgeting"
    | "compound-interest"
    | "insurance"
    | "mutual-funds"
    | "credit-scores";

export interface LessonCard {
    id: string;
    title: string;
    content: string; // markdown-like content
    keyTakeaway: string;
    icon: string; // lucide icon name
    interactiveExample?: InteractiveExample;
}

export interface InteractiveExample {
    type: "slider" | "toggle" | "calculator";
    label: string;
    description: string;
}

// ---- Quiz Types (State Machine) ----

export type QuestionType = "mcq" | "true-false" | "slider" | "scenario";

export interface QuizQuestionBase {
    id: string;
    question: string;
    explanation: string;
    xpReward: number;
}

export interface MCQQuestion extends QuizQuestionBase {
    type: "mcq";
    options: string[];
    correctIndex: number;
}

export interface TrueFalseQuestion extends QuizQuestionBase {
    type: "true-false";
    correctAnswer: boolean;
}

export interface SliderQuestion extends QuizQuestionBase {
    type: "slider";
    min: number;
    max: number;
    step: number;
    unit: string;
    correctValue: number;
    tolerance: number; // percentage tolerance for "close enough"
}

export interface ScenarioQuestion extends QuizQuestionBase {
    type: "scenario";
    scenario: string;
    options: { label: string; description: string }[];
    correctIndex: number;
}

export type QuizQuestion =
    | MCQQuestion
    | TrueFalseQuestion
    | SliderQuestion
    | ScenarioQuestion;

// Quiz State Machine
export type QuizState =
    | { status: "idle" }
    | { status: "answering"; currentIndex: number; answers: (number | boolean | null)[] }
    | { status: "reviewing"; currentIndex: number; answers: (number | boolean | null)[]; selectedAnswer: number | boolean | null }
    | { status: "complete"; answers: (number | boolean | null)[]; score: number; xpEarned: number; correctCount: number; totalCount: number };

// ---- Module Definition ----

export interface GameModule {
    slug: ModuleSlug;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string; // tailwind color class
    gradientFrom: string;
    gradientTo: string;
    lessons: LessonCard[];
    quiz: QuizQuestion[];
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedMinutes: number;
}

// ---- Gamification Types ----

export interface PlayerLevel {
    level: number;
    title: string;
    minXP: number;
    maxXP: number;
}

export const LEVEL_TITLES: Record<number, string> = {
    1: "Penny Pincher",
    2: "Coin Collector",
    3: "Savings Starter",
    4: "Budget Apprentice",
    5: "Smart Saver",
    6: "Finance Rookie",
    7: "Money Manager",
    8: "Budget Warrior",
    9: "Investment Scout",
    10: "Portfolio Builder",
    11: "Risk Assessor",
    12: "Market Watcher",
    13: "Fund Analyst",
    14: "Credit Master",
    15: "Insurance Expert",
    16: "Diversification Pro",
    17: "Compound Crusher",
    18: "Wealth Strategist",
    19: "Financial Guru",
    20: "Wealth Architect",
    21: "Market Oracle",
    22: "Finance Sage",
    23: "Economy Titan",
    24: "Fiscal Legend",
    25: "Money Maestro",
    26: "Capital Commander",
    27: "Fortune Forger",
    28: "Prosperity King",
    29: "Finance Overlord",
    30: "FinQuest Champion",
};

// ---- Achievement Types ----

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: "learning" | "streak" | "quiz" | "special";
    condition: AchievementCondition;
    xpReward: number;
}

export type AchievementCondition =
    | { type: "modules_completed"; count: number }
    | { type: "quizzes_completed"; count: number }
    | { type: "perfect_quiz" }
    | { type: "streak_days"; count: number }
    | { type: "total_xp"; amount: number }
    | { type: "level_reached"; level: number }
    | { type: "all_modules_complete" }
    | { type: "assessment_complete" }
    | { type: "simulator_used" }
    | { type: "first_quiz" };

// ---- Player Progress Types ----

export interface ModuleProgress {
    slug: ModuleSlug;
    lessonsCompleted: number[];  // indices of completed lessons
    quizCompleted: boolean;
    quizScore: number | null;     // percentage 0-100
    quizBestScore: number | null;
    lastAccessedAt: string | null; // ISO date
}

export interface PlayerState {
    // Identity
    playerName: string;
    avatarIndex: number;

    // XP & Level
    totalXP: number;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: string | null; // ISO date string

    // Module progress
    moduleProgress: Record<ModuleSlug, ModuleProgress>;

    // Achievements
    unlockedAchievements: string[]; // achievement IDs
    newAchievements: string[]; // unseen achievements

    // Assessment
    assessmentCompleted: boolean;
    assessmentScore: number | null;
    assessmentBreakdown: FinancialHealthBreakdown | null;

    // Stats
    totalQuizzesCompleted: number;
    totalLessonsCompleted: number;
    totalPerfectQuizzes: number;
    simulatorUsed: boolean;

    // Timestamps
    createdAt: string;
    onboardingComplete: boolean;
}

// ---- Financial Health Assessment ----

export interface AssessmentQuestion {
    id: string;
    question: string;
    category: FinancialDimension;
    options: { label: string; score: number }[];
}

export type FinancialDimension =
    | "budgeting"
    | "savings"
    | "debt"
    | "insurance"
    | "investment";

export interface FinancialHealthBreakdown {
    budgeting: number;   // 0-100
    savings: number;      // 0-100
    debt: number;         // 0-100
    insurance: number;    // 0-100
    investment: number;   // 0-100
    overall: number;      // 0-100
}

// ---- Simulator Types ----

export interface CompoundInterestParams {
    principal: number;
    monthlyContribution: number;
    annualRate: number; // percentage
    years: number;
}

export interface CompoundInterestResult {
    year: number;
    totalContributed: number;
    interestEarned: number;
    totalValue: number;
}

export interface BudgetAllocation {
    needs: number;       // percentage
    wants: number;       // percentage
    savings: number;     // percentage
    income: number;      // absolute amount
}

export interface CreditScoreFactors {
    paymentHistory: number;    // 0-100
    creditUtilization: number; // 0-100
    creditAge: number;         // 0-100
    creditMix: number;         // 0-100
    newCredit: number;         // 0-100
}