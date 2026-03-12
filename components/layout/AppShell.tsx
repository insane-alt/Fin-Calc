// ============================================================
// FinQuest — App Shell (client wrapper with nav + toasts)
// ============================================================

"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import AchievementToast from "@/components/game/AchievementToast";
import { useGameStore } from "@/lib/finquest/store";
import { useEffect } from "react";

const HIDE_NAV_ROUTES = ["/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onboardingComplete = useGameStore((s) => s.onboardingComplete);
  const checkAndUpdateStreak = useGameStore((s) => s.checkAndUpdateStreak);

  // Check streak on app load
  useEffect(() => {
    if (onboardingComplete) {
      checkAndUpdateStreak();
    }
  }, [onboardingComplete, checkAndUpdateStreak]);

  const showNav =
    onboardingComplete && !HIDE_NAV_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <AchievementToast />
      <div className="page-shell">
        <div className="page-content">{children}</div>
      </div>
      {showNav && <BottomNav />}
    </>
  );
}
