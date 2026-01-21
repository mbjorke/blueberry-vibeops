import React from 'react';
import { LucideIcon, Target, Trophy, Crown, Star, Sparkles, Zap, Palette, Tag, BarChart3, Folder, User, Calendar, ThumbsUp, MessageCircle, HelpCircle, Rocket, FileText, CheckCircle } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  '🎯': Target,
  '🏆': Trophy,
  '👑': Crown,
  '⭐': Star,
  '✨': Sparkles,
  '💫': Zap,
  '🎨': Palette,
  '🏷️': Tag,
  '📊': BarChart3,
  '📂': Folder,
  '👤': User,
  '📅': Calendar,
  '👍': ThumbsUp,
  '💬': MessageCircle,
  '🤔': HelpCircle,
  '🚀': Rocket,
  '📝': FileText,
};

interface SmartIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const SmartIcon: React.FC<SmartIconProps> = ({ icon, size = 24, className = '' }) => {
  const IconComponent = iconMap[icon];

  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to the original emoji if no mapping found
  return <span className={className}>{icon}</span>;
};