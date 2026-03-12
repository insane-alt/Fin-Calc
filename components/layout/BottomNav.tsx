// ============================================================
// FinQuest — Bottom Navigation
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Gamepad2, User, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/finquest", icon: Home, label: "Home" },
  { href: "/finquest/modules", icon: BookOpen, label: "Learn" },
  { href: "/finquest/playground", icon: Gamepad2, label: "Play" },
  { href: "/finquest/leaderboard", icon: Trophy, label: "Rank" },
  { href: "/finquest/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav glass">
      <div className="flex items-center justify-around h-(--nav-height) max-w-120 mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/finquest"
              ? pathname === "/finquest"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-[rgba(108,92,231,0.15)]"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
              <item.icon
                size={22}
                className={`relative z-10 transition-colors ${
                  isActive
                    ? "text-(--accent-primary-light)"
                    : "text-(--foreground-dim)"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] mt-1 font-medium transition-colors ${
                  isActive
                    ? "text-(--accent-primary-light)"
                    : "text-(--foreground-dim)"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
