// Shared Design System Tokens for SevaRecover

export const DESIGN_TOKENS = {
  colors: {
    primary: {
      bg: '#0F172A',
      main: '#312E81',
      light: '#4338CA',
      accent: '#6366F1',
      subtle: '#EEF2FF',
    },
    secondary: {
      main: '#16A34A',
      light: '#22C55E',
      subtle: '#ECFDF5',
    },
    amber: {
      main: '#D97706',
      light: '#22C55E',
      subtle: '#FEF3C7',
    },
    rose: {
      main: '#DC2626',
      light: '#EF4444',
      subtle: '#FEE2E2',
    },
    neutral: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      border: '#E2E8F0',
      textDark: '#0F172A',
      textMuted: '#64748B',
      textLight: '#94A3B8',
    }
  },
  animation: {
    easing: [0.4, 0, 0.2, 1] as const,
    durationFast: 0.2,
    durationNormal: 0.35,
    durationSlow: 0.5,
    staggerDelay: 0.1,
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
    md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
    lg: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
    hover: '0 20px 30px -10px rgba(49, 46, 129, 0.12), 0 10px 12px -5px rgba(15, 23, 42, 0.04)',
  }
};
