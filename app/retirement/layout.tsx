import RetirementNav from "./_components/RetirementNav";

export const metadata = {
  title: "RetireWise — Pension & Retirement Planning Calculator",
  description:
    "Calculate your retirement corpus, plan investments in PPF, NPS, and Mutual Funds, track goals, and set annual review reminders.",
};

export default function RetirementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <RetirementNav />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
    </div>
  );
}
