import { Button } from "@/components/ui/button";
import { Settings, Wallet, PiggyBank, Briefcase, CreditCard, Users } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";
import { cn } from "../../lib/utils";
import { AccountDetailsModal } from "./AccountDetailsModal";
import { useMemo, useState } from "react";

export type IconType = 'wallet' | 'piggy-bank' | 'briefcase' | 'credit-card' | 'users';

interface AccountCardProps {
  /**
   * The current balance of the account
   */
  balance: number;
  /**
   * The currency symbol to display
   * @default "€"
   */
  currency?: string;
  /**
   * The name of the account
   * @default "Account"
   */
  accountName?: string;
  /**
   * The type of account
   * @default 'checking'
   */
  accountType?: 'checking' | 'savings' | 'investment' | 'credit' | 'freelance';
  /**
   * The available balance (if different from the main balance)
   * @default 0
   */
  availableBalance?: number;
  /**
   * Whether the card is in a selected state
   * @default false
   */
  isSelected?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Click handler for the card
   */
  onClick?: () => void;
  /**
   * Color theme for the card
   * @default 'blue'
   */
  color?: string;
  /**
   * Icon to display for the account type
   */
  icon?: IconType;
}

/**
 * A card component for displaying account information with a gradient background.
 * Built on top of the GradientCard UI primitive.
 */
export function AccountCard({ 
  balance, 
  currency = "€",
  accountName = "Account",
  accountType = 'checking',
  availableBalance = 0,
  isSelected = false,
  className,
  onClick,
  color = 'blue',
  icon
}: AccountCardProps) {
  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Map icon names to their respective components with responsive sizes
  const iconMap = (size: string) => ({
    'wallet': <Wallet className={`${size} text-card-foreground/90`} />,
    'piggy-bank': <PiggyBank className={`${size} text-card-foreground/90`} />,
    'briefcase': <Briefcase className={`${size} text-card-foreground/90`} />,
    'credit-card': <CreditCard className={`${size} text-card-foreground/90`} />,
    'users': <Users className={`${size} text-card-foreground/90`} />
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <GradientCard
        className={cn("w-full max-w-md p-4 sm:p-5 text-card-foreground overflow-hidden relative group", className)}
        selected={isSelected}
        onClick={onClick}
        glow={isSelected}
        aria-label={`${accountName}, ${accountType} account`}
        aria-pressed={isSelected}
      >
      {/* Account Type Icon - Made smaller */}
      <div className={cn(
        "absolute -top-3 -right-3 w-16 h-16 sm:-top-6 sm:-right-6 sm:w-24 sm:h-24 rounded-full flex items-center justify-center opacity-90 transition-all duration-300 z-10",
        isSelected 
          ? "bg-gradient-primary" 
          : "bg-gradient-to-br from-accent/50 to-accent/10 hover:opacity-100",
        isSelected ? "shadow-lg shadow-primary/20" : ""
      )}>
        {icon && iconMap("w-full h-full")[icon] && (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 sm:w-10 sm:h-10">
              {iconMap("w-full h-full")[icon]}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <div className={cn(
              "text-base font-medium truncate text-white",
              isSelected ? "text-white" : "text-foreground/80"
            )}>
              {accountName}
            </div>
            <div className={cn(
              "text-xs font-medium",
              isSelected ? "text-white" : "text-foreground/60"
            )}>
              {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex items-end justify-between">
            <div>
              <div className={cn(
                "text-xs font-medium",
                isSelected ? "text-white" : "text-foreground/60"
              )}>
                Available Balance
              </div>
              <div className={cn(
                "text-2xl font-bold tracking-tight",
                isSelected ? "text-white" : "text-foreground/90"
              )}>
                {formatCurrency(balance)}
              </div>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
              aria-label="More account details"
            >
              <span>More details</span>
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

    </GradientCard>

    <AccountDetailsModal
      isOpen={isDetailsOpen}
      onClose={() => setIsDetailsOpen(false)}
      account={{
        name: accountName,
        type: accountType,
        accountNumber: '•••• 1234', // Replace with actual account data
        iban: 'FI21 1234 5600 0007 85', // Replace with actual IBAN
        currency,
        balance,
        availableBalance,
      }}
    />
  </>
  );
};