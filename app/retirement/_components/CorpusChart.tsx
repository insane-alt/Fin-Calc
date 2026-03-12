"use client";

import { useMemo } from "react";
import type { YearlyProjection } from "@/lib/retirement/types";
import { formatINR } from "@/lib/retirement/constants";

interface CorpusChartProps {
  projections: YearlyProjection[];
  retirementAge: number;
}

export default function CorpusChart({
  projections,
  retirementAge,
}: CorpusChartProps) {
  const {
    pathD,
    areaD,
    withdrawalPath,
    withdrawalArea,
    viewBox,
    points,
    maxVal,
    retirementX,
    gridLines,
    xLabels,
  } = useMemo(() => {
    if (projections.length === 0)
      return {
        pathD: "",
        areaD: "",
        withdrawalPath: "",
        withdrawalArea: "",
        viewBox: "0 0 800 400",
        points: [],
        maxVal: 1,
        retirementX: 0,
        gridLines: [],
        xLabels: [],
      };

    const W = 800;
    const H = 400;
    const padL = 0;
    const padR = 0;
    const padT = 20;
    const padB = 40;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const maxVal = Math.max(...projections.map((p) => p.savingsBalance), 1);

    const pts = projections.map((p, i) => ({
      x: padL + (i / (projections.length - 1)) * chartW,
      y: padT + chartH - (p.savingsBalance / maxVal) * chartH,
      data: p,
    }));

    // Split into accumulation / withdrawal
    const retIdx = projections.findIndex((p) => p.isRetired);
    const accPts = retIdx > 0 ? pts.slice(0, retIdx + 1) : pts;
    const witPts = retIdx > 0 ? pts.slice(retIdx) : [];

    const toPath = (arr: typeof pts) =>
      arr.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const toArea = (arr: typeof pts) => {
      if (arr.length === 0) return "";
      const base = padT + chartH;
      return (
        `M${arr[0].x},${base} ` +
        arr.map((p) => `L${p.x},${p.y}`).join(" ") +
        ` L${arr[arr.length - 1].x},${base} Z`
      );
    };

    // grid lines
    const gridCount = 5;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
      const val = (maxVal / gridCount) * i;
      const y = padT + chartH - (val / maxVal) * chartH;
      return { y, label: formatINR(val) };
    });

    // x-axis labels (every 5 years)
    const xLabels: { x: number; label: string }[] = [];
    for (let i = 0; i < projections.length; i += 5) {
      xLabels.push({
        x: pts[i].x,
        label: `${projections[i].age}`,
      });
    }

    return {
      pathD: toPath(accPts),
      areaD: toArea(accPts),
      withdrawalPath: toPath(witPts),
      withdrawalArea: toArea(witPts),
      viewBox: `0 0 ${W} ${H}`,
      points: pts,
      maxVal,
      retirementX: retIdx > 0 ? pts[retIdx].x : 0,
      gridLines,
      xLabels,
    };
  }, [projections]);

  if (projections.length === 0) return null;

  return (
    <div className="w-full">
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="accGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="witGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1="0"
              y1={g.y}
              x2="800"
              y2={g.y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="4 4"
            />
            <text
              x="4"
              y={g.y - 4}
              fill="currentColor"
              fillOpacity="0.4"
              fontSize="10"
              fontFamily="monospace"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y="390"
            fill="currentColor"
            fillOpacity="0.5"
            fontSize="11"
            textAnchor="middle"
            fontFamily="monospace"
          >
            Age {l.label}
          </text>
        ))}

        {/* Retirement line */}
        {retirementX > 0 && (
          <>
            <line
              x1={retirementX}
              y1="20"
              x2={retirementX}
              y2="360"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              strokeOpacity="0.6"
            />
            <text
              x={retirementX}
              y="15"
              fill="#ef4444"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              RETIREMENT
            </text>
          </>
        )}

        {/* Accumulation area + line */}
        <path d={areaD} fill="url(#accGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Withdrawal area + line */}
        {withdrawalArea && (
          <>
            <path d={withdrawalArea} fill="url(#witGrad)" />
            <path
              d={withdrawalPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Hover dots */}
        {points
          .filter((_, i) => i % 5 === 0)
          .map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill={p.data.isRetired ? "#f59e0b" : "#10b981"}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          Accumulation Phase
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          Withdrawal Phase
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500" />
          Retirement
        </span>
      </div>
    </div>
  );
}
