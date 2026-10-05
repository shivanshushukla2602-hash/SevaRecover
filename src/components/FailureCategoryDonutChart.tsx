import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip as RechartsTooltip } from 'recharts';
import { PieChart as PieIcon, Info } from 'lucide-react';

export interface FailureCategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface FailureCategoryDonutChartProps {
  data?: FailureCategoryData[];
  onCategorySelect?: (category: string) => void;
}

export const sampleFailureCategoryData: FailureCategoryData[] = [
  { category: "Document mismatch", count: 411, percentage: 32.0 },
  { category: "Missing documentation", count: 308, percentage: 24.0 },
  { category: "Verification failure", count: 228, percentage: 17.8 },
  { category: "Eligibility failure", count: 182, percentage: 14.2 },
  { category: "Deadline failure", count: 114, percentage: 8.9 },
  { category: "Other", count: 59, percentage: 4.6 },
];

const COLOR_MAP: Record<string, string> = {
  "Document mismatch": "#22C55E",      // Antique Gold
  "Missing documentation": "#22C55E",  // Bright Gold
  "Verification failure": "#A8ABB3",   // Metallic Silver
  "Eligibility failure": "#7A9B7E",    // Sage Green
  "Deadline failure": "#B5453F",       // Brick Red
  "Other": "#D9A74A",                  // Amber Gold
};

const FALLBACK_COLORS = ["#22C55E", "#22C55E", "#A8ABB3", "#7A9B7E", "#B5453F", "#D9A74A"];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function FailureCategoryDonutChart({
  data = sampleFailureCategoryData,
  onCategorySelect,
}: FailureCategoryDonutChartProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const totalCount = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.15)] p-8 text-center space-y-3 shadow-civic-sm">
        <div className="w-12 h-12 rounded-full bg-[#1C1C1F] text-[#A8ABB3] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6 text-[#22C55E]" />
        </div>
        <p className="text-sm font-bold text-[#F2F1EC]">No failure data available yet</p>
        <p className="text-xs text-[#9A9A9E]">Analysis logs will populate failure categories here.</p>
      </div>
    );
  }

  const activeItem = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-[#141416] rounded-2xl border border-[rgba(34,197,94,0.15)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)] space-y-6 relative overflow-hidden min-w-0"
    >
      {/* Header & Persistent Demonstration Data Badge */}
      <div className="flex items-center justify-between border-b border-[rgba(34,197,94,0.15)] pb-3">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-heading font-bold text-base text-[#F2F1EC]">
            Failure Category Breakdown
          </h3>
        </div>
        <span className="max-w-[120px] text-right px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
          Sample / Demonstration Data
        </span>
      </div>

      {/* Donut Chart Container with Absolutely-Positioned Overlay Center Text */}
      <div className="relative h-64 w-full flex items-center justify-center">
        
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4">
          {activeItem ? (
            <motion.div
              key={activeItem.category}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-0.5"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A8ABB3] block max-w-[140px] truncate">
                {activeItem.category}
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#F2F1EC] block leading-tight">
                {activeItem.count.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded-md inline-block">
                {activeItem.percentage.toFixed(1)}% of total
              </span>
            </motion.div>
          ) : (
            <div className="space-y-0.5">
              <span className="font-heading font-extrabold text-3xl text-[#F2F1EC] block leading-none">
                {totalCount.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8ABB3] block">
                Total Analyzed
              </span>
            </div>
          )}
        </div>

        {/* Recharts Pie / Donut Component */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="92%"
              paddingAngle={3}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={800}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, idx) => {
                if (onCategorySelect && data[idx]) {
                  onCategorySelect(data[idx].category);
                }
              }}
              cursor="pointer"
            >
              {data.map((entry, index) => {
                const fillColor = COLOR_MAP[entry.category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    aria-label={`${entry.category}: ${entry.count} applications (${entry.percentage}%)`}
                    className="transition-all duration-200 outline-none"
                  />
                );
              })}
            </Pie>
            
            {/* Custom Tooltip matching civic card/shadow tokens */}
            <RechartsTooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const item = payload[0].payload as FailureCategoryData;
                  const color = COLOR_MAP[item.category] || '#22C55E';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="bg-[#0A0A0B] text-[#F2F1EC] p-3 rounded-xl shadow-civic-lg border border-[rgba(34,197,94,0.4)] text-xs space-y-1 pointer-events-none"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[#22C55E]">
                        <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: color }} />
                        <span>{item.category}</span>
                      </div>
                      <p className="text-[#A8ABB3] font-mono">
                        Count: <strong className="text-[#F2F1EC]">{item.count.toLocaleString()}</strong> ({item.percentage}%)
                      </p>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Custom Legend Grid */}
      <div className="pt-2 border-t border-[rgba(34,197,94,0.15)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.map((item, index) => {
            const color = COLOR_MAP[item.category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
            const isHovered = activeIndex === index;

            return (
              <button
                key={item.category}
                tabIndex={0}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => {
                  if (onCategorySelect) onCategorySelect(item.category);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onCategorySelect) onCategorySelect(item.category);
                  }
                }}
                className={`p-2 rounded-xl text-left border transition-all duration-150 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#22C55E] ${
                  isHovered
                    ? 'bg-[#22C55E]/15 border-[#22C55E]/40 shadow-sm scale-[1.02]'
                    : 'bg-[#1C1C1F] border-[rgba(34,197,94,0.15)] hover:bg-[#141416]'
                }`}
                aria-label={`Filter by ${item.category}, ${item.percentage}% of failures`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-[#F2F1EC] truncate">
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#A8ABB3] font-mono ml-1">
                  {item.percentage.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
}

export default FailureCategoryDonutChart;
