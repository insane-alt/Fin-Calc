// ============================================================
// FinQuest — Zustand Store with localStorage Persistence
// ============================================================

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
    ModuleSlug,
    PlayerState,
    ModuleProgress,
    FinancialHealthBreakdown,
} from "./types";
import { checkAchievements, ACHIEVEMENTS } from "./achievements";
import {
    getXPProgress,
    getStreakMultiplier,
    calculateQuizScore,
} from "./financial-engine";

const MODULE_SLUGS: ModuleSlug[] = [
    "budgeting",
    "compound-interest",
    "insurance",
    "mutual-funds",
    "credit-scores",
];

function createInitialModuleProgress(): Record<ModuleSlug, ModuleProgress> {
    const progress: Partial<Record<ModuleSlug, ModuleProgress>> = {};
    for (const slug of MODULE_SLUGS) {
        progress[slug] = {
            slug,
            lessonsCompleted: [],
            quizCompleted: false,
            quizScore: null,
            quizBestScore: null,
            lastAccessedAt: null,
        };
    }
    return progress as Record<ModuleSlug, ModuleProgress>;
}

const initialState: PlayerState = {
    playerName: "",
    avatarIndex: 0,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    moduleProgress: createInitialModuleProgress(),
    unlockedAchievements: [],
    newAchievements: [],
    assessmentCompleted: false,
    assessmentScore: null,
    assessmentBreakdown: null,
    totalQuizzesCompleted: 0,
    totalLessonsCompleted: 0,
    totalPerfectQuizzes: 0,
    simulatorUsed: false,
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
};

interface GameActions {
    // Onboarding
    setPlayerName: (name: string) => void;
    setAvatarIndex: (index: number) => void;
    completeOnboarding: () => void;

    // XP
    addXP: (amount: number) => void;

    // Lessons
    completeLesson: (moduleSlug: ModuleSlug, lessonIndex: number) => void;

    // Quiz
    completeQuiz: (
        moduleSlug: ModuleSlug,
        correctCount: number,
        totalCount: number
    ) => void;

    // Assessment
    completeAssessment: (
        breakdown: FinancialHealthBreakdown,
        score: number
    ) => void;

    // Simulators
    markSimulatorUsed: () => void;

    // Streaks
    checkAndUpdateStreak: () => void;

    // Achievements
    clearNewAchievements: () => void;

    // Reset
    resetProgress: () => void;

    // Derived (computed on read)
    getXPProgress: () => ReturnType<typeof getXPProgress>;
}

export type GameStore = PlayerState & GameActions;

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setPlayerName: (name: string) => set({ playerName: name }),
            setAvatarIndex: (index: number) => set({ avatarIndex: index }),

            completeOnboarding: () => {
                set({ onboardingComplete: true });
                // Check for streak on first login
                get().checkAndUpdateStreak();
            },

            addXP: (amount: number) => {
                const state = get();
                const multiplier = getStreakMultiplier(state.currentStreak);
                const boostedAmount = Math.round(amount * multiplier);
                const newTotalXP = state.totalXP + boostedAmount;

                set({ totalXP: newTotalXP });

                // Check for new achievements after XP change
                const updatedState = get();
                const newAchievements = checkAchievements(updatedState);
                if (newAchievements.length > 0) {
                    // Add achievement XP rewards
                    let achievementXP = 0;
                    for (const id of newAchievements) {
                        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                        if (achievement) achievementXP += achievement.xpReward;
                    }

                    set({
                        unlockedAchievements: [
                            ...updatedState.unlockedAchievements,
                            ...newAchievements,
                        ],
                        newAchievements: [
                            ...updatedState.newAchievements,
                            ...newAchievements,
                        ],
                        totalXP: updatedState.totalXP + achievementXP,
                    });
                }
            },

            completeLesson: (moduleSlug: ModuleSlug, lessonIndex: number) => {
                const state = get();
                const mp = state.moduleProgress[moduleSlug];

                if (mp.lessonsCompleted.includes(lessonIndex)) return;

                const updatedProgress: ModuleProgress = {
                    ...mp,
                    lessonsCompleted: [...mp.lessonsCompleted, lessonIndex],
                    lastAccessedAt: new Date().toISOString(),
                };

                set({
                    moduleProgress: {
                        ...state.moduleProgress,
                        [moduleSlug]: updatedProgress,
                    },
                    totalLessonsCompleted: state.totalLessonsCompleted + 1,
                });

                // Award XP for lesson
                get().addXP(50);
            },

            completeQuiz: (
                moduleSlug: ModuleSlug,
                correctCount: number,
                totalCount: number
            ) => {
                const state = get();
                const mp = state.moduleProgress[moduleSlug];
                const { percentage, xpBase } = calculateQuizScore(
                    correctCount,
                    totalCount
                );

                const isPerfect = percentage === 100;
                const isNewBest =
                    mp.quizBestScore === null || percentage > mp.quizBestScore;

                const updatedProgress: ModuleProgress = {
                    ...mp,
                    quizCompleted: true,
                    quizScore: percentage,
                    quizBestScore: isNewBest ? percentage : mp.quizBestScore,
                    lastAccessedAt: new Date().toISOString(),
                };

                const wasFirstTime = !mp.quizCompleted;

                set({
                    moduleProgress: {
                        ...state.moduleProgress,
                        [moduleSlug]: updatedProgress,
                    },
                    totalQuizzesCompleted: state.totalQuizzesCompleted + (wasFirstTime ? 1 : 0),
                    totalPerfectQuizzes:
                        state.totalPerfectQuizzes + (isPerfect && wasFirstTime ? 1 : 0),
                });

                // Award XP
                get().addXP(xpBase + (isPerfect ? 50 : 0));
            },

            completeAssessment: (
                breakdown: FinancialHealthBreakdown,
                score: number
            ) => {
                set({
                    assessmentCompleted: true,
                    assessmentScore: score,
                    assessmentBreakdown: breakdown,
                });
                get().addXP(100);
            },

            markSimulatorUsed: () => {
                const state = get();
                if (!state.simulatorUsed) {
                    set({ simulatorUsed: true });
                    get().addXP(25);
                }
            },

            checkAndUpdateStreak: () => {
                const state = get();
                const today = new Date().toISOString().split("T")[0];
                const lastLogin = state.lastLoginDate;

                if (lastLogin === today) return; // Already checked in today

                if (lastLogin) {
                    const lastDate = new Date(lastLogin);
                    const todayDate = new Date(today);
                    const diffDays = Math.floor(
                        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays === 1) {
                        // Consecutive day
                        const newStreak = state.currentStreak + 1;
                        set({
                            currentStreak: newStreak,
                            longestStreak: Math.max(state.longestStreak, newStreak),
                            lastLoginDate: today,
                        });
                        // Daily login XP
                        get().addXP(25);
                    } else if (diffDays > 1) {
                        // Streak broken
                        set({
                            currentStreak: 1,
                            lastLoginDate: today,
                        });
                        get().addXP(25);
                    }
                } else {
                    // First ever login
                    set({
                        currentStreak: 1,
                        longestStreak: 1,
                        lastLoginDate: today,
                    });
                }
            },

            clearNewAchievements: () => set({ newAchievements: [] }),

            resetProgress: () =>
                set({
                    ...initialState,
                    createdAt: new Date().toISOString(),
                }),

            getXPProgress: () => getXPProgress(get().totalXP),
        }),
        {
            name: "finquest-game-store",
            storage: createJSONStorage(() =>
                typeof window !== "undefined"
                    ? localStorage
                    : {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    }
            ),
        }
    )
);