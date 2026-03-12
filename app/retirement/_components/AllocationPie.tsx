"use client";

import { useMemo } from "react";
import type { AllocationSplit } from "@/lib/retirement/types";
import { formatINR } from "@/lib/retirement/constants";

interface AllocationPieProps {
  allocations: AllocationSplit[];
  size?: number;
}

export default function AllocationPie({
  allocations,
  size = 240,
}: AllocationPieProps) {
  const segments = useMemo(() => {
    const total = allocations.reduce((s, a) => s + a.percentage, 0);
    if (total === 0) return [];

    let cumAngle = -90; // start from top
    return allocations.map((a) => {
      const angle = (a.percentage / total) * 360;
      const startAngle = cumAngle;
      const endAngle = cumAngle + angle;
      cumAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const r = 90;
      const cx = 100;
      const cy = 100;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;

      // Label position (midpoint of arc)
      const midRad = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      const lx = cx + r * 0.65 * Math.cos(midRad);
      const ly = cy + r * 0.65 * Math.sin(midRad);

      return { ...a, path, lx, ly, angle };
    });
  }, [allocations]);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="drop-shadow-lg"
      >
        {segments.map((seg, i) => (
          <g key={seg.vehicleId}>
            <path
              d={seg.path}
              fill={seg.color}
              stroke="white"
              strokeWidth="1.5"
              className="dark:stroke-slate-900"
              opacity="0.9"
            />
            {seg.angle > 25 && (
              <text
                x={seg.lx}
                y={seg.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {seg.percentage}%
              </text>
            )}
          </g>
        ))}
        {/* Center circle for donut effect */}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="white"
          className="dark:fill-slate-900"
        />
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fill="currentColor"
          fontSize="9"
          fontWeight="bold"
          className="fill-slate-700 dark:fill-slate-200"
        >
          Monthly
        </text>
        <text
          x="100"
          y="110"
          textAnchor="middle"
          fill="currentColor"
          fontSize="8"
          className="fill-slate-500 dark:fill-slate-400"
        >
          SIP Split
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {allocations.map((a) => (
          <div key={a.vehicleId} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 text-xs">
              {a.vehicleName.split(" ")[0]}
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs ml-auto">
              {formatINR(a.monthlyAmount)}/mo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
