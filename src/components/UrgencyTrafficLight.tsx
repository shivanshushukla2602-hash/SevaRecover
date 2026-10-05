import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { DeadlineProximity } from '../types';

interface UrgencyTrafficLightProps {
  proximity: DeadlineProximity;
  deadlineText?: string;
}

export const UrgencyTrafficLight: React.FC<UrgencyTrafficLightProps> = ({
  proximity,
  deadlineText,
}) => {
  if (proximity === 'urgent') {
    return (
      <div className="bg-[#B5453F]/10 border border-[#B5453F]/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#B5453F] animate-ping shrink-0" />
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xs text-[#B5453F] uppercase tracking-wide">
              Urgent Deadline Proximity
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B5453F]/20 text-[#B5453F]">
              Action Required Immediately
            </span>
          </div>
        </div>
        {deadlineText && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B5453F]">
            <AlertCircle className="w-4 h-4 text-[#B5453F]" />
            <span>{deadlineText}</span>
          </div>
        )}
      </div>
    );
  }

  if (proximity === 'moderate') {
    return (
      <div className="bg-[#D9A74A]/10 border border-[#D9A74A]/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#D9A74A] shrink-0" />
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xs text-[#D9A74A] uppercase tracking-wide">
              Moderate Window Remaining
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9A74A]/20 text-[#D9A74A]">
              Standard Processing
            </span>
          </div>
        </div>
        {deadlineText && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D9A74A]">
            <Clock className="w-4 h-4 text-[#D9A74A]" />
            <span>{deadlineText}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#7A9B7E]/10 border border-[#7A9B7E]/30 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-3 h-3 rounded-full bg-[#7A9B7E] shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-xs text-[#7A9B7E] uppercase tracking-wide">
            No Immediate Deadline Expiration
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7A9B7E]/20 text-[#7A9B7E]">
            Open Window
          </span>
        </div>
      </div>
      {deadlineText && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A9B7E]">
          <CheckCircle className="w-4 h-4 text-[#7A9B7E]" />
          <span>{deadlineText}</span>
        </div>
      )}
    </div>
  );
};
