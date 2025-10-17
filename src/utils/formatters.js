import { format } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateShort = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, 'MMM d');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthName = (monthString) => {
  const date = new Date(monthString + "-01");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};