import toast from 'react-hot-toast';

export const handleError = (error: any) => {
  // Extract error message from various possible response structures
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.message ||
    error?.message ||
    'An unexpected error occurred';
  toast.error(message);
  console.error(error);
};

export const getErrorMessage = (error: any): string => {
  // Extract error message for display in forms/components
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.message ||
    error?.message ||
    'An unexpected error occurred'
  );
};

