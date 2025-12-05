import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useClickOutside } from '../../hooks/useClickOutside';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-2.5 text-sm font-medium text-left',
          'bg-white dark:bg-gray-800',
          'border border-gray-300 dark:border-gray-600',
          'rounded-lg shadow-sm',
          'flex items-center justify-between gap-2',
          'transition-all duration-200 ease-in-out',
          'hover:border-gray-400 dark:hover:border-gray-500',
          'hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 focus:border-transparent',
          'active:scale-[0.98]',
          isOpen && 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
        )}
      >
        <span className={cn(
          'truncate flex items-center gap-2',
          !selectedOption && 'text-gray-500 dark:text-gray-400'
        )}>
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="text-gray-900 dark:text-white">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ease-in-out',
            isOpen && 'transform rotate-180'
          )}
          size={18}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-hidden">
          <div className="overflow-auto max-h-60">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-sm text-left',
                  'flex items-center gap-2',
                  'transition-colors duration-150 ease-in-out',
                  'first:rounded-t-lg last:rounded-b-lg',
                  value === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  index !== options.length - 1 && 'border-b border-gray-100 dark:border-gray-700/50'
                )}
              >
                {option.icon && (
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {option.icon}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <span className="ml-auto flex-shrink-0 text-primary-600 dark:text-primary-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

