"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const apps = [
  {
    href: "/finquest",
    title: "FinQuest",
    subtitle: "Financial Intelligence",
    description:
      "Navigate your financial journey with smart insights, goal tracking, and personalized strategies to build lasting wealth.",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <path
          d="M6 36L18 22L26 30L36 16L42 22"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36 16H42V22"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="22" r="2.5" fill="currentColor" />
        <circle cx="26" cy="30" r="2.5" fill="currentColor" />
        <circle cx="36" cy="16" r="2.5" fill="currentColor" />
      </svg>
    ),
    accent: "#F5A623",
    tag: "Wealth Building",
  },
  {
    href: "/retirement",
    title: "Retirement Calc",
    subtitle: "Plan Your Future",
    description:
      "Calculate your ideal retirement with precision — model savings scenarios, estimate returns, and know exactly when you can retire comfortably.",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
        <path
          d="M24 14V24L30 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 24H6M42 24H40M24 8V6M24 42V40"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    accent: "#4ECDC4",
    tag: "Long-term Planning",
  },
  {
    href: "/fetch/news",
    title: "Market Pulse",
    subtitle: "Latest Financial News",
    description:
      "Stay ahead with real-time financial news, market-moving headlines, and curated insights from global financial markets.",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <rect
          x="6"
          y="10"
          width="36"
          height="28"
          rx="3"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M14 18H26M14 24H34M14 30H22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="34" cy="30" r="4" fill="currentColor" opacity="0.3" />
        <circle cx="34" cy="30" r="2" fill="currentColor" />
      </svg>
    ),
    accent: "#E056A0",
    tag: "Real-time Updates",
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0A0C0F;
          --surface: #111318;
          --border: rgba(255,255,255,0.07);
          --text-primary: #F0EDE8;
          --text-muted: rgba(240,237,232,0.45);
        }

        body {
          background: var(--bg);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          opacity: 0.5;
        }

        .hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border);
          background: rgba(10,12,15,0.85);
          backdrop-filter: blur(16px);
        }
        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-decoration: none;
        }
        .logo span {
          color: #F5A623;
        }
        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }
        .nav-links a {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }
        .nav-links a:hover { color: var(--text-primary); }

        /* HERO */
        .hero {
          padding-top: 160px;
          padding-bottom: 80px;
          text-align: center;
          position: relative;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #F5A623;
          margin-bottom: 24px;
          padding: 6px 14px;
          border: 1px solid rgba(245,166,35,0.3);
          border-radius: 100px;
        }
        .hero-eyebrow::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #F5A623;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .hero h1 em {
          font-style: italic;
          color: #F5A623;
        }
        .hero-sub {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 300;
        }

        /* DIVIDER */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 64px 0 48px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .divider-label {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* CARDS GRID */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        /* CARD */
        .card {
          background: var(--surface);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
          transition: background 0.3s;
          group: true;
        }
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--card-accent, #F5A623) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .card:hover {
          background: #141619;
        }
        .card:hover::before {
          opacity: 0.04;
        }

        .card-tag {
          font-size: 0.68rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 20px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .card:hover .card-tag { opacity: 1; }

        .card-icon-wrap {
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }
        .card:hover .card-icon-wrap {
          transform: translateY(-3px);
        }

        .card h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .card-subtitle {
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-weight: 500;
          opacity: 0.5;
        }
        .card p {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-muted);
          flex: 1;
          margin-bottom: 28px;
        }
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          transition: gap 0.2s;
        }
        .card:hover .card-cta { gap: 12px; }
        .card-cta svg {
          transition: transform 0.2s;
        }
        .card:hover .card-cta svg {
          transform: translateX(3px);
        }

        /* CARD CORNER ACCENT */
        .card-corner {
          position: absolute;
          top: 0; right: 0;
          width: 80px; height: 80px;
          opacity: 0.07;
          transition: opacity 0.3s;
          border-radius: 0 0 0 80px;
        }
        .card:hover .card-corner { opacity: 0.15; }

        /* FOOTER */
        footer {
          margin-top: 80px;
          border-top: 1px solid var(--border);
          padding: 32px 24px;
          text-align: center;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-copy {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .footer-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }
        .footer-links a {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text-primary); }

        /* FADE-IN ANIMATION */
        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.6s forwards;
        }
        .fade-up:nth-child(1) { animation-delay: 0.1s; }
        .fade-up:nth-child(2) { animation-delay: 0.2s; }
        .fade-up:nth-child(3) { animation-delay: 0.3s; }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .nav-links { display: none; }
          .hero { padding-top: 120px; }
          .cards-grid { grid-template-columns: 1fr; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="noise">
        {/* NAV */}
        <nav>
          <div className="nav-inner">
            <Link href="/" className="logo">
              Fin<span>Hub</span>
            </Link>
            <ul className="nav-links">
              <li>
                <Link href="/finquest">FinQuest</Link>
              </li>
              <li>
                <Link href="/retirement">Retirement</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero wrapper">
          <div className="hero-glow" />
          <div className="hero-eyebrow">Your Financial Command Center</div>
          <h1>
            Money tools that
            <br />
            <em>actually work</em>
          </h1>
          <p className="hero-sub">
            Three focused apps to grow your wealth, plan your future, and stay
            ahead of every market shift.
          </p>

          <div className="divider">
            <span className="divider-label">Choose your tool</span>
          </div>
        </section>

        {/* CARDS */}
        <section className="wrapper" style={{ paddingBottom: "24px" }}>
          <div className="cards-grid">
            {apps.map((app, i) => (
              <Link
                key={app.href}
                href={app.href}
                className={`card fade-up`}
                style={{ "--card-accent": app.accent } as React.CSSProperties}
              >
                {/* corner accent */}
                <div
                  className="card-corner"
                  style={{ background: app.accent }}
                />

                <span className="card-tag" style={{ color: app.accent }}>
                  {app.tag}
                </span>

                <div className="card-icon-wrap" style={{ color: app.accent }}>
                  {app.icon}
                </div>

                <h2>{app.title}</h2>
                <p className="card-subtitle">{app.subtitle}</p>
                <p>{app.description}</p>

                <span className="card-cta" style={{ color: app.accent }}>
                  Open app
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8H13M13 8L9 4M13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <span className="footer-copy">
              © {new Date().getFullYear()} FinHub. All rights reserved.
            </span>
            <ul className="footer-links">
              <li>
                <Link href="/finquest">FinQuest</Link>
              </li>
              <li>
                <Link href="/retirement">Retirement Calc</Link>
              </li>
              <li>
                <Link href="/fetch/news">Market Pulse</Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
}
