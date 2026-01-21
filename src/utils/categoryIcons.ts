import { categoryIcons } from '@/components/fintech/constants';
import { CreditCard } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

// Fallback icons for common merchant types
export const fallbackIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'food': categoryIcons.food,
  'restaurant': categoryIcons.food,
  'coffee': categoryIcons.food,
  'grocery': categoryIcons.food,
  'transport': categoryIcons.transport,
  'shopping': categoryIcons.shopping,
  'salary': categoryIcons.income,
  'income': categoryIcons.income,
  'savings': categoryIcons.savings,
  'investment': categoryIcons.investment,
  'rent': categoryIcons.housing,
  'housing': categoryIcons.housing,
  'utilities': categoryIcons.utilities,
  'technology': categoryIcons.technology,
  'healthcare': categoryIcons.healthcare,
  'education': categoryIcons.education,
  'other': categoryIcons.other,
  'unmapped': categoryIcons.unmapped,
};

// Map of merchant names to their specific icons
export const merchantIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'Blue Bottle Coffee': categoryIcons.food,
  'Local Restaurant': categoryIcons.food,
  'Whole Foods': categoryIcons.food,
  'Public Transport': categoryIcons.transport,
  'Amazon': categoryIcons.shopping,
  'Starbucks': categoryIcons.food,
  'Uber': categoryIcons.transport,
  'Lyft': categoryIcons.transport,
  'Target': categoryIcons.shopping,
  'Walmart': categoryIcons.shopping,
  'Netflix': categoryIcons.entertainment,
  'Spotify': categoryIcons.entertainment,
  'Apple': categoryIcons.technology,
  'Google': categoryIcons.technology,
  'Microsoft': categoryIcons.technology,
};

/**
 * Get the appropriate icon component for a merchant or category
 */
export const getCategoryIcon = (merchantName?: string, category?: string) => {
  if (merchantName && merchantIcons[merchantName]) {
    return merchantIcons[merchantName];
  }
  
  const categoryKey = category?.toLowerCase() || 'other';
  return fallbackIcons[categoryKey] || CreditCard;
};
