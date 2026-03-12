// ============================================================
// FinQuest — Achievements Definitions
// ============================================================

import type { Achievement, PlayerState } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
    // Learning Achievements
    {
        id: "first_lesson",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "BookOpen",
        category: "learning",
        condition: { type: "modules_completed", count: 0 },
        xpReward: 25,
    },
    {
        id: "module_1_complete",
        title: "Budget Boss",
        description: "Complete the Budgeting module",
        icon: "Wallet",
        category: "learning",
        condition: { type: "modules_completed", count: 1 },
        xpReward: 100,
    },
    {
        id: "module_3_complete",
        title: "Halfway Hero",
        description: "Complete 3 modules",
        icon: "Award",
        category: "learning",
        condition: { type: "modules_completed", count: 3 },
        xpReward: 200,
    },
    {
        id: "all_modules",
        title: "Knowledge Master",
        description: "Complete all 5 modules",
        icon: "Crown",
        category: "learning",
        condition: { type: "all_modules_complete" },
        xpReward: 500,
    },

    // Quiz Achievements
    {
        id: "first_quiz",
        title: "Quiz Rookie",
        description: "Complete your first quiz",
        icon: "HelpCircle",
        category: "quiz",
        condition: { type: "first_quiz" },
        xpReward: 50,
    },
    {
        id: "perfect_score",
        title: "Perfectionist",
        description: "Score 100% on any quiz",
        icon: "Star",
        category: "quiz",
        condition: { type: "perfect_quiz" },
        xpReward: 150,
    },
    {
        id: "quiz_5",
        title: "Quiz Warrior",
        description: "Complete 5 quizzes",
        icon: "Swords",
        category: "quiz",
        condition: { type: "quizzes_completed", count: 5 },
        xpReward: 200,
    },
    {
        id: "quiz_10",
        title: "Quiz Legend",
        description: "Complete 10 quizzes",
        icon: "Trophy",
        category: "quiz",
        condition: { type: "quizzes_completed", count: 10 },
        xpReward: 300,
    },

    // Streak Achievements
    {
        id: "streak_3",
        title: "Getting Started",
        description: "Maintain a 3-day streak",
        icon: "Flame",
        category: "streak",
        condition: { type: "streak_days", count: 3 },
        xpReward: 75,
    },
    {
        id: "streak_7",
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "Zap",
        category: "streak",
        condition: { type: "streak_days", count: 7 },
        xpReward: 150,
    },
    {
        id: "streak_14",
        title: "Fortnight Force",
        description: "Maintain a 14-day streak",
        icon: "Flame",
        category: "streak",
        condition: { type: "streak_days", count: 14 },
        xpReward: 300,
    },
    {
        id: "streak_30",
        title: "Monthly Master",
        description: "Maintain a 30-day streak",
        icon: "Crown",
        category: "streak",
        condition: { type: "streak_days", count: 30 },
        xpReward: 500,
    },

    // Special Achievements
    {
        id: "assessment_done",
        title: "Self-Aware",
        description: "Complete the financial health assessment",
        icon: "Heart",
        category: "special",
        condition: { type: "assessment_complete" },
        xpReward: 100,
    },
    {
        id: "simulator_explorer",
        title: "Simulator Explorer",
        description: "Use a financial simulator",
        icon: "Calculator",
        category: "special",
        condition: { type: "simulator_used" },
        xpReward: 50,
    },
    {
        id: "xp_500",
        title: "Rising Star",
        description: "Earn 500 total XP",
        icon: "TrendingUp",
        category: "special",
        condition: { type: "total_xp", amount: 500 },
        xpReward: 50,
    },
    {
        id: "xp_2000",
        title: "Finance Enthusiast",
        description: "Earn 2000 total XP",
        icon: "Rocket",
        category: "special",
        condition: { type: "total_xp", amount: 2000 },
        xpReward: 100,
    },
    {
        id: "xp_5000",
        title: "XP Millionaire",
        description: "Earn 5000 total XP",
        icon: "Gem",
        category: "special",
        condition: { type: "total_xp", amount: 5000 },
        xpReward: 200,
    },
    {
        id: "level_5",
        title: "Leveling Up",
        description: "Reach level 5",
        icon: "ChevronUp",
        category: "special",
        condition: { type: "level_reached", level: 5 },
        xpReward: 100,
    },
    {
        id: "level_10",
        title: "Double Digits",
        description: "Reach level 10",
        icon: "ArrowUpCircle",
        category: "special",
        condition: { type: "level_reached", level: 10 },
        xpReward: 200,
    },
    {
        id: "level_20",
        title: "Elite Status",
        description: "Reach level 20",
        icon: "Shield",
        category: "special",
        condition: { type: "level_reached", level: 20 },
        xpReward: 500,
    },
];

// Check which achievements should be newly unlocked
export function checkAchievements(state: PlayerState): string[] {
    const newlyUnlocked: string[] = [];
    const { getLevelFromXP } = require("./financial-engine");

    const modulesCompleted = Object.values(state.moduleProgress).filter(
        (m) => m.quizCompleted
    ).length;

    const currentLevel = getLevelFromXP(state.totalXP).level;

    for (const achievement of ACHIEVEMENTS) {
        // Skip already unlocked
        if (state.unlockedAchievements.includes(achievement.id)) continue;

        let unlocked = false;
        const cond = achievement.condition;

        switch (cond.type) {
            case "modules_completed":
                unlocked = modulesCompleted >= cond.count;
                // Special case: first_lesson is about total lessons
                if (achievement.id === "first_lesson") {
                    unlocked = state.totalLessonsCompleted >= 1;
                }
                break;
            case "quizzes_completed":
                unlocked = state.totalQuizzesCompleted >= cond.count;
                break;
            case "perfect_quiz":
                unlocked = state.totalPerfectQuizzes >= 1;
                break;
            case "streak_days":
                unlocked = state.longestStreak >= cond.count;
                break;
            case "total_xp":
                unlocked = state.totalXP >= cond.amount;
                break;
            case "level_reached":
                unlocked = currentLevel >= cond.level;
                break;
            case "all_modules_complete":
                unlocked = modulesCompleted >= 5;
                break;
            case "assessment_complete":
                unlocked = state.assessmentCompleted;
                break;
            case "simulator_used":
                unlocked = state.simulatorUsed;
                break;
            case "first_quiz":
                unlocked = state.totalQuizzesCompleted >= 1;
                break;
        }

        if (unlocked) {
            newlyUnlocked.push(achievement.id);
        }
    }

    return newlyUnlocked;
}