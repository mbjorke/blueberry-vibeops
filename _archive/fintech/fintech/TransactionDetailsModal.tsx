import { 
  Calendar, 
  Clock, 
  X, 
  Pencil, 
  Sparkles, 
  Loader2,
  User,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Upload,
  FileText,
  Receipt,
  CreditCard as CardIcon
} from "lucide-react";
import { Transaction } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryColorClasses } from "./constants";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { AvatarWithIcon } from "@/components/ui/avatar-with-icon";

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}



export const TransactionDetailsModal = ({ 
  transaction, 
  open, 
  onOpenChange 
}: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const isIncoming = transaction.type === 'incoming';
  const isUnmapped = !transaction.merchantName || transaction.merchantName === 'Unknown' || transaction.merchantName === 'Unknown Merchant' || transaction.category === 'unmapped';
  const category = transaction.category || 'other';
  const colors = getCategoryColorClasses(transaction.category, isUnmapped);
  const formattedMerchantName = transaction.merchantName || 'Unknown Merchant';

  const formatAmount = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    return `${isIncoming ? '+' : '-'}${currency}${formatted}`;
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime(transaction.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-card/80 backdrop-blur-lg border ${isUnmapped ? 'border-amber-500/50' : 'border-border'} text-foreground max-w-md mx-auto`}>
        <DialogHeader>
          <div className="flex items-center gap-4">
            {/* Merchant Avatar with consistent styling */}
            <div className="flex flex-col items-start gap-2 w-full">
              
              {/* Avatar, Name,Amount and Date */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <AvatarWithIcon
                      imageUrl={transaction.merchantImage}
                      name={transaction.merchantName}
                      icon={getCategoryIcon(transaction.merchantName, isUnmapped ? 'unmapped' : transaction.category)}
                      colorClass="bg-card"
                      iconColorClass="text-foreground"
                      size={56}
                      className="h-14 w-14"
                    />
                  </div>
                  <div>
                    <DialogTitle className={`text-lg font-normal ${
                      isIncoming ? 'text-success' : 'text-foreground'
                    }`}>
                      {formattedMerchantName}
                    </DialogTitle>
                    <h3 className={`text-xl font-bold ${isIncoming ? 'text-success' : 'text-foreground'}`}>
                      {formatAmount(transaction.amount, transaction.currency)}
                    </h3>
                  </div>
                </div>
                {transaction.merchantDetails && (
                  <p className="text-base text-foreground/70">
                    {transaction.merchantDetails}
                  </p>
                )}
                <p className="text-base text-foreground/70 mt-1 flex items-center gap-1.5">
                  <Calendar size={12} className="text-foreground/70/70" />
                  {formattedDate}
                  <span className="mx-1">•</span>
                  <Clock size={12} className="text-foreground/70/70" />
                  {formattedTime}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

          {isUnmapped && (
            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Help us understand this transaction
              </h3>
              <p className="text-base text-amber-700 dark:text-amber-300 mb-4">
                We couldn't automatically identify this transaction. Please provide more details to help us categorize it correctly.
              </p>
              <Button variant="default" className="bg-amber-500 hover:bg-amber-600 text-amber-50">
                <Pencil className="mr-2 h-4 w-4" />
                Add Details
              </Button>
            </div>
          )}
          
          <div className="space-y-6 pt-4">
            {/* Status Section */}
          {transaction.expenseStatus !== 'none' && (
            <div className="space-y-3 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Expense status</span>
                <Badge 
                  variant={
                    transaction.expenseStatus === 'approved' ? 'default' :
                    transaction.expenseStatus === 'submitted' ? 'outline' :
                    transaction.expenseStatus === 'info_required' ? 'warning' :
                    'secondary'
                  }
                  className="capitalize"
                >
                  {transaction.expenseStatus.replace('_', ' ')}
                </Badge>
              </div>
              
              {transaction.spendProgram && (
                <div className="flex items-center justify-between">
                  <span className="text-base text-foreground/70">Spend program</span>
                  <span className="text-base font-medium">{transaction.spendProgram}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Cardholder Information */}
          <div className="space-y-3 transition-all duration-200">
            <div className="flex items-center gap-2">
              <User size={16} className="text-foreground/70" />
              <span className="text-base font-medium">Cardholder</span>
            </div>
            <p className="text-base text-foreground/70 pl-6">{transaction.cardholder}</p>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-4 transition-all duration-200">
            <h3 className="text-base font-medium">Transaction details</h3>
            
            <div className="space-y-3 text-base">
              {transaction.cardLast4 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardIcon size={16} className="text-foreground/70" />
                    <span className="text-foreground/70">Card</span>
                  </div>
                  <span>•••• {transaction.cardLast4}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-foreground/70" />
                  <span className="text-foreground/70">Transaction ID</span>
                </div>
                <span className="font-mono text-base">{transaction.transactionId}</span>
              </div>

              {transaction.location && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-foreground/70" />
                    <span className="text-foreground/70">Location</span>
                  </div>
                  <span>{transaction.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-foreground/70" />
                  <span className="text-foreground/70">Category</span>
                </div>
                <div className="flex items-center gap-2">
                  <AvatarWithIcon
                    icon={getCategoryIcon(undefined, category)}
                    name={category}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    showLabel
                    colorClass={getCategoryColorClasses(category, isUnmapped).bg}
                    iconColorClass={getCategoryColorClasses(category, isUnmapped).icon}
                    size={24}
                    className="gap-2"
                  />
                  <Badge 
                    variant={transaction.categorySource === 'manual' ? 'default' : 'outline'}
                    className="h-4 px-2 text-base flex items-center gap-0.5"
                    title={transaction.categorySource === 'manual' ? 'Manually categorized' : 'Automatically categorized'}
                  >
                    {transaction.categorySource === 'manual' ? (
                      <>
                        <Pencil size={10} /> Manual
                      </>
                    ) : (
                      <>
                        <Sparkles size={10} /> Auto
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Expense Details */}
          {transaction.expenseStatus !== 'none' && (
            <div className="space-y-4 transition-all duration-200">
              <h3 className="text-base font-medium">Expense details</h3>
              
              {/* Receipt Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-foreground/70" />
                    <span className="text-base text-foreground/70">Receipts</span>
                  </div>
                  <Badge 
                    variant={transaction.receiptStatus === 'uploaded' ? 'default' : 'outline'}
                    className="text-base"
                  >
                    {transaction.receiptStatus === 'uploaded' ? 'Uploaded' : 
                     transaction.receiptStatus === 'required' ? 'Required' : 'None'}
                  </Badge>
                </div>
                
                {transaction.receiptStatus === 'required' && (
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload size={16} className="mr-2" />
                    Upload Receipt
                  </Button>
                )}
              </div>

              {/* Additional Fields */}
              <div className="space-y-3 text-base">
                {transaction.accountingCategory && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Accounting category</span>
                    <span>{transaction.accountingCategory}</span>
                  </div>
                )}
                
                {transaction.taxRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Tax rate</span>
                    <span>{transaction.taxRate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};