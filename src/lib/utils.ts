import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to determine text color based on positive/negative value
export function getChangeColor(value: number | null | undefined, type: 'positive' | 'negative' | 'auto' = 'auto'): string {
  const num = Number(value);
  if (isNaN(num)) return 'text-muted-foreground'; // Default for non-numeric

  if (type === 'positive') return 'text-green-600 dark:text-green-500';
  if (type === 'negative') return 'text-red-600 dark:text-red-500';

  // Auto-detect based on value if type is 'auto'
  if (num > 0) {
    return 'text-green-600 dark:text-green-500';
  } else if (num < 0) {
    return 'text-red-600 dark:text-red-500';
  } else {
    return 'text-muted-foreground'; // Neutral color for zero
  }
}

// Function to format currency (Indian Rupees)
export function formatCurrency(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '₹--'; // Placeholder for null/undefined
  const num = Number(value);
  if (isNaN(num)) return '₹--'; // Placeholder for non-numeric
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Function to format percentage
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '--%';
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
