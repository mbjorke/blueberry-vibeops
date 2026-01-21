import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "react-day-picker";

export interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the card should have a glowing effect
   * @default false
   */
  glow?: boolean;
  /**
   * The direction of the gradient
   * @default 'to-br' (bottom-right)
   */
  gradientDirection?: 'to-t' | 'to-tr' | 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl';
  /**
   * The starting color of the gradient (Tailwind color class)
   * @default 'from-accent/20'
   */
  from?: string;
  /**
   * The ending color of the gradient (Tailwind color class)
   * @default 'to-accent/10'
   */
  to?: string;
  /**
   * Whether the card is in a selected/active state
   * @default false
   */
  selected?: boolean;
  /**
   * The selected state gradient start color (Tailwind color class)
   * @default 'from-accent'
   */
  selectedFrom?: string;
  /**
   * The selected state gradient end color (Tailwind color class)
   * @default 'to-accent/50'
   */
  selectedTo?: string;
}

/**
 * A card component with gradient background and optional glow effect.
 * Extends the base Card component with gradient styling capabilities.
 */
const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({
    className,
    children,
    glow = false,
    gradientDirection = 'to-br',
    from = 'from-accent/30 dark:from-accent/20',
    to = 'to-accent/20 dark:to-accent/10',
    selected = false,
    selectedFrom = 'from-accent',
    selectedTo = 'to-accent/70 dark:to-accent/50',
    ...props
  }, ref) => {
    const gradientClass = selected 
      ? `${selectedFrom} ${selectedTo}`
      : `${from} dark:${from} ${to} dark:${to}`;

    return (
      <div
        ref={ref}
        className={cn(
          'focus:ring-2 focus:ring-offset-1 focus:ring-offset-accent focus:ring-accent outline-none',
          'rounded-2xl outline-none cursor-pointer overflow-hidden transition-all duration-300 transform',
          'hover:-translate-y-1 hover:scale-[1.01] active:scale-100',
          `bg-gradient-${gradientDirection} ${gradientClass}`,
          className
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          // Trigger click on Enter or Space
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GradientCard.displayName = 'GradientCard';

export { 
  GradientCard, 
  CardContent as GradientCardContent, 
  CardHeader as GradientCardHeader, 
  CardTitle as GradientCardTitle, 
  CardDescription as GradientCardDescription, 
  CardFooter as GradientCardFooter 
};

export default GradientCard;
