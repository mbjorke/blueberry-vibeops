import { Badge } from "@/components/ui/badge";
import { Transaction } from "./types";
import { getCategoryColorClasses } from "./constants";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { AvatarWithIcon } from "@/components/ui/avatar-with-icon";
import { cn } from "../../lib/utils";

/**
 * TransactionItem Component
 * 
 * Displays individual transaction information with appropriate icons,
 * categories, and styling based on transaction type.
 * Enhanced with smooth hover animations and click feedback.
 * Responsive design optimized for mobile and desktop.
 * 
 * Props:
 * - transaction: Transaction object containing all transaction details
 * - isUnmapped: Optional boolean indicating if transaction is unmapped
 * - isOdd: Optional boolean indicating if transaction is odd
 * - onClick: Optional callback when transaction is clicked
 */

interface TransactionItemProps {
  transaction: Transaction;
  isUnmapped?: boolean;
  onClick?: () => void;
}

export function TransactionItem({ transaction, isUnmapped = false, onClick }: TransactionItemProps) {
  const isIncoming = transaction.type === 'incoming';
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    return `${isIncoming ? '+' : '-'}${currency}${formatted}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-label={`${transaction.merchantDetails || transaction.merchantName || 'Transaction'} for ${formatAmount(transaction.amount, transaction.currency)} on ${transaction.date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      className={cn(
        "flex w-full items-start gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg transition-all duration-200 cursor-pointer text-left",
        "transform hover:scale-[1.005] active:scale-100 odd:bg-accent/5 even:bg-accent/10",
        "focus:ring-2 focus:ring-offset-1 focus:ring-offset-accent focus:ring-accent outline-none",
        "min-h-[68px] touch-manipulation", // Consistent height and better touch
        {
          "cursor-pointer": onClick,
          "cursor-default": !onClick
        }
      )}
    >
      {/* Avatar - Optimized for mobile */}
      <div className="flex-shrink-0" aria-hidden="true">
        <AvatarWithIcon
          imageUrl={transaction.merchantImage}
          name={transaction.merchantName}
          icon={getCategoryIcon(transaction.merchantName, isUnmapped ? 'unmapped' : transaction.category)}
          colorClass={getCategoryColorClasses(transaction.category, isUnmapped).bg}
          iconColorClass={getCategoryColorClasses(transaction.category, isUnmapped).icon}
          size={40}
        />
      </div>

      {/* Transaction Details - Mobile-first layout */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground text-sm leading-tight mb-1" id={`transaction-${transaction.id}-merchant`}>
              {transaction.merchantDetails || transaction.merchantName || transaction.description}
            </h3>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <time 
                dateTime={transaction.date.toISOString()}
                aria-label={`Date: ${transaction.date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              >
                {formatDate(transaction.date)}
              </time>
              {transaction.cardLast4 && (
                <span>•••• {transaction.cardLast4}</span>
              )}
            </div>
            {(transaction.expenseStatus !== 'none' || transaction.status !== 'completed') && (
              <div className="flex gap-1 mt-1">
                {transaction.expenseStatus !== 'none' && (
                  <Badge 
                    variant={
                      transaction.expenseStatus === 'approved' ? 'default' :
                      transaction.expenseStatus === 'submitted' ? 'outline' :
                      transaction.expenseStatus === 'info_required' ? 'warning' :
                      'secondary'
                    }
                    className="text-xs px-1.5 py-0.5"
                  >
                    {transaction.expenseStatus.replace('_', ' ')}
                  </Badge>
                )}
                {transaction.status !== 'completed' && (
                  <Badge 
                    variant={transaction.status === 'pending' ? 'outline' : 'destructive'}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {transaction.status}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Amount - Right aligned */}
          <div className="text-right flex-shrink-0">
            <p 
              className={`font-semibold text-sm ${
                isIncoming ? 'text-success' : 'text-foreground'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="sr-only">
                {isIncoming ? 'Credit: ' : 'Debit: '}
              </span>
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};