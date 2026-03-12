// ============================================================
// FinQuest — Financial Health Assessment Questions
// ============================================================

import type { AssessmentQuestion } from "./types";

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
    // Budgeting (2 questions)
    {
        id: "a1",
        question: "Do you follow a monthly budget?",
        category: "budgeting",
        options: [
            { label: "Yes, I track every expense", score: 100 },
            { label: "Roughly — I have a general idea", score: 70 },
            { label: "Sometimes, when I remember", score: 40 },
            { label: "No, I spend as needed", score: 10 },
        ],
    },
    {
        id: "a2",
        question: "What percentage of your income typically remains at month-end?",
        category: "budgeting",
        options: [
            { label: "More than 30%", score: 100 },
            { label: "20-30%", score: 80 },
            { label: "10-20%", score: 50 },
            { label: "Almost nothing or I overspend", score: 10 },
        ],
    },

    // Savings (2 questions)
    {
        id: "a3",
        question: "How many months of expenses do you have in an emergency fund?",
        category: "savings",
        options: [
            { label: "6+ months", score: 100 },
            { label: "3-6 months", score: 75 },
            { label: "1-3 months", score: 40 },
            { label: "No emergency fund", score: 5 },
        ],
    },
    {
        id: "a4",
        question: "Do you save or invest automatically each month?",
        category: "savings",
        options: [
            { label: "Yes, via SIP/auto-transfer on payday", score: 100 },
            { label: "I manually save what's left", score: 50 },
            { label: "Occasionally, when I can", score: 25 },
            { label: "No regular savings", score: 5 },
        ],
    },

    // Debt (2 questions)
    {
        id: "a5",
        question: "How do you handle credit card payments?",
        category: "debt",
        options: [
            { label: "Pay full balance every month", score: 100 },
            { label: "Pay most of it, carry a small balance", score: 60 },
            { label: "Pay minimum balance usually", score: 20 },
            { label: "I don't have a credit card / Don't use credit", score: 70 },
        ],
    },
    {
        id: "a6",
        question: "What is your total EMI/debt payment relative to income?",
        category: "debt",
        options: [
            { label: "No debt / Under 10% of income", score: 100 },
            { label: "10-30% of income", score: 70 },
            { label: "30-50% of income", score: 35 },
            { label: "Over 50% of income", score: 10 },
        ],
    },

    // Insurance (2 questions)
    {
        id: "a7",
        question: "Do you have health insurance?",
        category: "insurance",
        options: [
            { label: "Yes, personal + employer coverage", score: 100 },
            { label: "Only employer-provided", score: 50 },
            { label: "Basic plan / Low coverage", score: 30 },
            { label: "No health insurance", score: 5 },
        ],
    },
    {
        id: "a8",
        question: "Do you have term life insurance (if you have dependents)?",
        category: "insurance",
        options: [
            { label: "Yes, adequate coverage (10x+ annual income)", score: 100 },
            { label: "Some coverage, but probably not enough", score: 50 },
            { label: "Only employer-provided life insurance", score: 30 },
            { label: "No / Not applicable (no dependents)", score: 60 },
        ],
    },

    // Investment (2 questions)
    {
        id: "a9",
        question: "How do you invest your savings?",
        category: "investment",
        options: [
            { label: "Diversified: equity, debt, mutual funds, etc.", score: 100 },
            { label: "Mutual funds or stocks only", score: 70 },
            { label: "Fixed deposits / savings account only", score: 35 },
            { label: "I don't invest — money stays in savings", score: 10 },
        ],
    },
    {
        id: "a10",
        question: "How long is your typical investment horizon?",
        category: "investment",
        options: [
            { label: "5+ years (long-term focus)", score: 100 },
            { label: "2-5 years", score: 70 },
            { label: "Less than 2 years", score: 40 },
            { label: "I haven't thought about it", score: 10 },
        ],
    },
];