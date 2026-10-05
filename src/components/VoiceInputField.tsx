import React from 'react';
import { VoiceMicButton } from './VoiceMicButton';

interface VoiceInputFieldProps {
  label?: React.ReactNode;
  value: string;
  onChange: (newValue: string) => void;
  type?: 'text' | 'textarea';
  rows?: number;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  rightBadge?: React.ReactNode;
  id?: string;
  fieldLabelText?: string;
}

export const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  rows = 4,
  placeholder,
  className = '',
  inputClassName = '',
  rightBadge,
  id,
  fieldLabelText,
}) => {
  const extractedLabel = fieldLabelText || (typeof label === 'string' ? label : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || rightBadge) && (
        <div className="flex items-center justify-between gap-2">
          {typeof label === 'string' ? (
            <label htmlFor={id} className="font-heading font-bold text-sm text-brand-900 flex items-center gap-2">
              {label}
            </label>
          ) : (
            label
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            <VoiceMicButton
              currentValue={value}
              onTranscript={onChange}
              fieldLabel={extractedLabel}
            />
            {rightBadge}
          </div>
        </div>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={
            inputClassName ||
            'w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none leading-relaxed resize-none transition-all'
          }
        />
      ) : (
        <div className="relative">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={
              inputClassName ||
              'w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-brand-500'
            }
          />
          {!label && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceMicButton currentValue={value} onTranscript={onChange} fieldLabel={extractedLabel} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
