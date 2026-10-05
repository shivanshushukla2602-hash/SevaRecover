import React from 'react';
import { motion } from 'framer-motion';

interface FlowConnectorProps {
  color?: string;
  isReducedMotion?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const FlowConnector: React.FC<FlowConnectorProps> = ({
  color = '#22C55E', // Antique Gold default
  isReducedMotion = false,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`flex justify-center items-center h-8 w-full select-none pointer-events-none ${className}`}>
        <svg className="h-8 w-8 overflow-visible" viewBox="0 0 20 32">
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="24"
            stroke="rgba(168, 171, 179, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <polygon points="6,22 14,22 10,29" fill={color} opacity="0.85" />
          {!isReducedMotion ? (
            <>
              <motion.circle
                cx="10"
                cy="0"
                r="3"
                fill={color}
                animate={{ cy: [0, 24] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0, ease: 'linear' }}
              />
              <motion.circle
                cx="10"
                cy="0"
                r="3"
                fill={color}
                animate={{ cy: [0, 24] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0.9, ease: 'linear' }}
              />
            </>
          ) : (
            <circle cx="10" cy="12" r="3" fill={color} opacity="0.6" />
          )}
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center w-full select-none pointer-events-none px-1 ${className}`}>
      <svg className="w-full max-w-[64px] h-6 overflow-visible" viewBox="0 0 56 20">
        <line
          x1="0"
          y1="10"
          x2="48"
          y2="10"
          stroke="rgba(168, 171, 179, 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <polygon points="46,6 46,14 54,10" fill={color} opacity="0.85" />
        {!isReducedMotion ? (
          <>
            <motion.circle
              cx="0"
              cy="10"
              r="3"
              fill={color}
              animate={{ cx: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0, ease: 'linear' }}
            />
            <motion.circle
              cx="0"
              cy="10"
              r="3"
              fill={color}
              animate={{ cx: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.9, ease: 'linear' }}
            />
          </>
        ) : (
          <circle cx="24" cy="10" r="3" fill={color} opacity="0.6" />
        )}
      </svg>
    </div>
  );
};

export default FlowConnector;
