import React from 'react';
import { cn } from '../../utils/helpers';

interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        disabled={disabled}
        className={cn(
          'w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
};

