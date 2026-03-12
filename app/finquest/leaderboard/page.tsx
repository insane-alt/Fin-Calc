// ============================================================
// FinQuest — Leaderboard Page
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Flame, Star } from "lucide-react";
import { useGameStore } from "@/lib/finquest/store";
import { getLevelFromXP } from "@/lib/finquest/financial-engine";
import PageTransition from "@/components/layout/PageTransition";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  title: string;
  streak: number;
  isPlayer: boolean;
}

// Static mock leaderboard entries — adds variety and motivation
const MOCK_PLAYERS: Omit<LeaderboardEntry, "rank" | "isPlayer">[] = [
  {
    name: "Arjun M.",
    avatar: "👨‍🚀",
    xp: 4850,
    level: 15,
    title: "Insurance Expert",
    streak: 23,
  },
  {
    name: "Priya K.",
    avatar: "👩‍💼",
    xp: 4200,
    level: 14,
    title: "Credit Master",
    streak: 18,
  },
  {
    name: "Rahul S.",
    avatar: "🧑‍💻",
    xp: 3600,
    level: 12,
    title: "Market Watcher",
    streak: 12,
  },
  {
    name: "Neha D.",
    avatar: "🧑‍🎓",
    xp: 3100,
    level: 11,
    title: "Risk Assessor",
    streak: 9,
  },
  {
    name: "Vikram P.",
    avatar: "🦸",
    xp: 2400,
    level: 9,
    title: "Investment Scout",
    streak: 7,
  },
  {
    name: "Ananya R.",
    avatar: "👩‍💼",
    xp: 1900,
    level: 8,
    title: "Budget Warrior",
    streak: 5,
  },
  {
    name: "Karthik V.",
    avatar: "🧙",
    xp: 1200,
    level: 6,
    title: "Finance Rookie",
    streak: 4,
  },
  {
    name: "Meera J.",
    avatar: "🧑‍🎓",
    xp: 800,
    level: 5,
    title: "Smart Saver",
    streak: 3,
  },
  {
    name: "Rohan B.",
    avatar: "👨‍🚀",
    xp: 400,
    level: 3,
    title: "Savings Starter",
    streak: 1,
  },
  {
    name: "Aisha T.",
    avatar: "🦸",
    xp: 150,
    level: 2,
    title: "Coin Collector",
    streak: 1,
  },
];

const AVATARS = ["🧑‍🎓", "👩‍💼", "🧑‍💻", "👨‍🚀", "🦸", "🧙"];

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const playerName = useGameStore((s) => s.playerName);
  const avatarIndex = useGameStore((s) => s.avatarIndex);
  const totalXP = useGameStore((s) => s.totalXP);
  const currentStreak = useGameStore((s) => s.currentStreak);

  useEffect(() => {
    setMounted(true);
  }, []);

  const leaderboard = useMemo(() => {
    const playerLevel = getLevelFromXP(totalXP);

    const playerEntry: Omit<LeaderboardEntry, "rank"> = {
      name: playerName || "You",
      avatar: AVATARS[avatarIndex] || "🧑‍🎓",
      xp: totalXP,
      level: playerLevel.level,
      title: playerLevel.title,
      streak: currentStreak,
      isPlayer: true,
    };

    // Combine player with mock data
    const allPlayers: Omit<LeaderboardEntry, "rank">[] = [
      playerEntry,
      ...MOCK_PLAYERS.map((p) => ({ ...p, isPlayer: false })),
    ];

    // Sort by XP descending
    allPlayers.sort((a, b) => b.xp - a.xp);

    // Assign ranks
    return allPlayers.map((p, i) => ({ ...p, rank: i + 1 }));
  }, [playerName, avatarIndex, totalXP, currentStreak]);

  const playerRank = leaderboard.find((e) => e.isPlayer)?.rank ?? 0;

  if (!mounted) return null;

  return (
    <PageTransition>
      <div className="space-y-5 pt-2 pb-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={24} className="text-(--accent-warning)" />
            Leaderboard
          </h1>
          <p className="text-sm text-(--foreground-muted) mt-1">
            See how you stack up
          </p>
        </div>

        {/* Player Card */}
        <motion.div
          className="card p-4 border border-(--accent-primary)/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="text-3xl">{AVATARS[avatarIndex] || "🧑‍🎓"}</div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-(--accent-primary) flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">
                  #{playerRank}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{playerName || "You"}</p>
              <p className="text-[10px] text-(--accent-primary)">
                Your Ranking
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold gradient-text-xp">
                {totalXP.toLocaleString()} XP
              </p>
              <p className="text-[10px] text-(--foreground-muted) flex items-center gap-1 justify-end">
                <Flame size={10} className="text-(--accent-danger)" />{" "}
                {currentStreak}d streak
              </p>
            </div>
          </div>
        </motion.div>

        {/* Podium — Top 3 */}
        <div className="flex items-end justify-center gap-3 px-4">
          {/* 2nd Place */}
          {leaderboard.length > 1 && (
            <PodiumCard entry={leaderboard[1]} height="h-24" delay={0.2} />
          )}
          {/* 1st Place */}
          {leaderboard.length > 0 && (
            <PodiumCard
              entry={leaderboard[0]}
              height="h-32"
              delay={0}
              isFirst
            />
          )}
          {/* 3rd Place */}
          {leaderboard.length > 2 && (
            <PodiumCard entry={leaderboard[2]} height="h-20" delay={0.4} />
          )}
        </div>

        {/* Full List */}
        <div className="space-y-2">
          {leaderboard.slice(3).map((entry, i) => (
            <motion.div
              key={entry.name + entry.xp}
              className={`card p-3 flex items-center gap-3 ${
                entry.isPlayer ? "border border-(--accent-primary)/30" : ""
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="w-7 text-center">
                <span className="text-xs font-bold text-(--foreground-muted)">
                  #{entry.rank}
                </span>
              </div>
              <div className="text-xl">{entry.avatar}</div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${entry.isPlayer ? "text-(--accent-primary)" : ""}`}
                >
                  {entry.name} {entry.isPlayer && "(You)"}
                </p>
                <p className="text-[10px] text-(--foreground-muted)">
                  Lv.{entry.level} · {entry.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold">
                  {entry.xp.toLocaleString()} XP
                </p>
                <p className="text-[10px] text-(--foreground-muted) flex items-center gap-0.5 justify-end">
                  <Flame size={8} className="text-orange-400" /> {entry.streak}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivation */}
        <div className="card p-4 text-center">
          <TrendingUp
            size={20}
            className="mx-auto text-(--accent-success) mb-2"
          />
          <p className="text-xs text-(--foreground-muted)">
            {playerRank === 1
              ? "🏆 You're #1! Keep up the amazing work!"
              : playerRank <= 3
                ? "🔥 You're on the podium! Keep climbing!"
                : `Complete more modules and quizzes to climb the ranks!`}
          </p>
        </div>
      </div>
    </PageTransition>
  );
}

// ============================================================
// Podium Card Component
// ============================================================

function PodiumCard({
  entry,
  height,
  delay,
  isFirst,
}: {
  entry: LeaderboardEntry;
  height: string;
  delay: number;
  isFirst?: boolean;
}) {
  const rankIcon =
    entry.rank === 1 ? (
      <Crown size={16} className="text-yellow-400" />
    ) : entry.rank === 2 ? (
      <Medal size={16} className="text-gray-300" />
    ) : (
      <Medal size={16} className="text-amber-600" />
    );

  return (
    <motion.div
      className="flex-1 flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={`text-2xl mb-1 ${isFirst ? "text-3xl" : ""}`}>
        {entry.avatar}
      </div>
      <div className="mb-1">{rankIcon}</div>
      <p
        className={`text-[10px] font-bold text-center truncate w-full ${
          entry.isPlayer ? "text-(--accent-primary)" : ""
        }`}
      >
        {entry.name}
      </p>
      <p className="text-[9px] text-(--foreground-muted)">
        {entry.xp.toLocaleString()} XP
      </p>
      <motion.div
        className={`w-full ${height} rounded-t-xl mt-1 flex items-end justify-center pb-2 ${
          entry.rank === 1
            ? "bg-linear-to-t from-yellow-500/30 to-yellow-500/5"
            : entry.rank === 2
              ? "bg-linear-to-t from-gray-400/20 to-gray-400/5"
              : "bg-linear-to-t from-amber-600/20 to-amber-600/5"
        }`}
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        <span className="text-lg font-bold text-(--foreground-muted)">
          #{entry.rank}
        </span>
      </motion.div>
    </motion.div>
  );
}
