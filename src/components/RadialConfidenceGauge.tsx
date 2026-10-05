import React from 'react';
import { motion } from 'framer-motion';
import { ConfidenceLevel } from '../types';

interface RadialConfidenceGaugeProps {
  confidence: ConfidenceLevel;
  explanation: string;
}

export const RadialConfidenceGauge: React.FC<RadialConfidenceGaugeProps> = ({ confidence, explanation }) => {
  const getPercentage = () => {
    switch (confidence) {
      case 'high': return 96;
      case 'medium': return 75;
      case 'low': return 48;
      default: return 85;
    }
  };

  const getColor = () => {
    switch (confidence) {
      case 'high': return { stroke: '#22C55E', bg: 'rgba(16, 185, 129, 0.1)', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'medium': return { stroke: '#22C55E', bg: 'rgba(245, 158, 11, 0.1)', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      default: return { stroke: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    }
  };

  const percentage = getPercentage();
  const theme = getColor();
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#141416] border border-[rgba(34,197,94,0.15)] rounded-xl p-3.5 flex items-center gap-3.5">
      
      {/* Animated Radial SVG Arc */}
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgba(168, 171, 179, 0.2)"
            strokeWidth="7"
            fill="transparent"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="7"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute font-heading font-extrabold text-xs text-[#F2F1EC]">
          {percentage}%
        </span>
      </div>

      {/* Label and Explanation */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#F2F1EC]">OpenSearch RAG Match:</span>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badge}`}>
            {confidence} Confidence
          </span>
        </div>
        <p className="text-[11px] text-[#9A9A9E] leading-tight max-w-sm">
          {explanation}
        </p>
      </div>

    </div>
  );
};
