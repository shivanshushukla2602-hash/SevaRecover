import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

interface ResolutionPatternBadgeProps {
  totalSimilarCases: number;
  resolvedCount: number;
  primarySolutionSummary: string;
}

export const ResolutionPatternBadge: React.FC<ResolutionPatternBadgeProps> = ({
  totalSimilarCases,
  resolvedCount,
  primarySolutionSummary,
}) => {
  const percentage = Math.round((resolvedCount / totalSimilarCases) * 100);

  return (
    <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-5 shadow-civic-md border border-indigo-800/60 relative overflow-hidden">
      
      {/* Background Subtle Accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-accent-amber" />
            <span>Community Resolution Benchmark</span>
          </div>

          <h4 className="font-heading font-bold text-lg text-white leading-tight">
            {resolvedCount} of {totalSimilarCases} similar applications resolved
          </h4>

          <p className="text-xs text-indigo-100/90 leading-relaxed font-normal max-w-xl">
            {primarySolutionSummary}
          </p>
        </div>

        <div className="shrink-0 text-center bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-xl font-heading justify-center">
            <TrendingUp className="w-4 h-4" />
            <span>{percentage}%</span>
          </div>
          <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold block">
            Success Rate
          </span>
        </div>
      </div>

    </div>
  );
};
