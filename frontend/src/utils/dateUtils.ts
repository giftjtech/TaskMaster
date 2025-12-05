import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'hh:mm a');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (date: string | Date): boolean => {
  return isPast(new Date(date)) && !isToday(new Date(date));
};

export const getDueDateLabel = (date: string | Date): string => {
  if (isToday(new Date(date))) return 'Today';
  if (isTomorrow(new Date(date))) return 'Tomorrow';
  if (isOverdue(date)) return 'Overdue';
  return formatDate(date);
};

