import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useClickOutside } from '../../hooks/useClickOutside';

interface DatePickerProps {
  label?: string;
  error?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  value,
  onChange,
  className,
  placeholder = 'Select date...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(datePickerRef, () => setIsOpen(false));

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = formatDate(newDate);
    const syntheticEvent = {
      target: { value: formattedDate },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div ref={datePickerRef} className={cn('relative', className)}>
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
            isOpen && 'border-primary-500 ring-2 ring-primary-500 ring-offset-1',
            error && 'border-error focus:ring-error'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className={cn(
              'truncate',
              value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            )}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-72 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => handleMonthChange('prev')}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                </button>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                  {monthName}
                </h3>
                <button
                  type="button"
                  onClick={() => handleMonthChange('next')}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-0.5"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-7" />;
                  }

                  const dayIsToday = isToday(day);
                  const dayIsSelected = isSelected(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        'h-7 w-7 rounded-md text-xs font-medium',
                        'transition-all duration-150 ease-in-out',
                        'flex items-center justify-center',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        dayIsToday && !dayIsSelected && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold',
                        dayIsSelected && 'bg-primary-500 text-white font-semibold shadow-sm',
                        !dayIsToday && !dayIsSelected && 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
