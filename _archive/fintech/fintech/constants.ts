import { Coffee, Car, ShoppingBag, Home, Smartphone, CreditCard, AlertCircle, DollarSign, TrendingUp, Percent, FileText, Zap, HeartPulse, BookOpen } from "lucide-react";

export const categoryIcons = {
  food: Coffee,
  transport: Car,
  shopping: ShoppingBag,
  housing: Home,
  technology: Smartphone,
  other: CreditCard,
  unmapped: AlertCircle,
  income: DollarSign,
  savings: TrendingUp,
  interest: Percent,
  investment: TrendingUp,
  dividend: Percent,
  fees: FileText,
  utilities: Zap,
  entertainment: HeartPulse,
  healthcare: HeartPulse,
  education: BookOpen,
} as const;

// Color definitions for dark mode only
type CategoryColorClasses = {
  bg: string;
  text: string;
  icon: string;
};

const baseColors: Record<string, CategoryColorClasses> = {
  food: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-400' },
  transport: { bg: 'bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', icon: 'text-violet-400' },
  shopping: { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', icon: 'text-pink-400' },
  housing: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-400' },
  utilities: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-400' },
  entertainment: { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-400' },
  healthcare: { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', icon: 'text-red-400' },
  education: { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', icon: 'text-cyan-400' },
  income: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-400' },
  savings: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-400' },
  interest: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-400' },
  investment: { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', icon: 'text-indigo-400' },
  dividend: { bg: 'bg-teal-500/15', text: 'text-teal-600 dark:text-teal-400', icon: 'text-teal-400' },
  fees: { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', icon: 'text-rose-400' },
  other: { bg: 'bg-gray-500/15', text: 'text-gray-600 dark:text-gray-400', icon: 'text-gray-400' },
  unmapped: { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-400' },
  technology: { bg: 'bg-cyan-500/15', text: 'text-white', icon: 'text-cyan-400' },
} as const;

// Helper function to generate consistent color classes
export const getCategoryColorClasses = (category: string, isUnmapped = false) => {
  const colors = baseColors[isUnmapped ? 'unmapped' : (category || 'other')] || baseColors.other;
  return {
    container: `${colors.bg} ${colors.text}`,
    bg: colors.bg,
    text: colors.text,
    icon: colors.icon,
  };
};
