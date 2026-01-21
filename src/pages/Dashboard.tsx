import { useState, useMemo } from "react";
import { Transaction, Account } from "@/components/fintech/types";
import { IconType } from "@/components/fintech/AccountCard";
import { getCategoryColorClasses } from "@/components/fintech/constants";
import { TransactionDetailsModal } from "@/components/fintech/TransactionDetailsModal";
import { TransactionItem } from "@/components/fintech/TransactionItem";
import { SpendingInsights } from "@/components/fintech/SpendingInsights";
import { AccountCard } from "@/components/fintech/AccountCard";
import { Button } from "@/components/ui/button";

import { 
  ArrowUpRight, 
  Filter, 
  Coffee,
  Car,
  ShoppingBag,
  Home,
  Smartphone,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import mock data
import {
  mockAccounts,
  mockTransactions,
  CATEGORY_BUDGETS,
  CATEGORY_LABELS,
} from "@/mock/mockData";

const Dashboard: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<Account>(() => {
    // Set the default account (first visible one or explicitly marked as default)
    return mockAccounts.find(acc => acc.isDefault) || mockAccounts[0];
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Memoize filtered transactions for the selected account
  const filteredTransactions = useMemo(() => {
    return mockTransactions
      .filter(tx => tx.accountId === selectedAccount.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [selectedAccount.id]);
  
  // Calculate total spent for the selected account
  const spent = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'outgoing')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);
  
  // Calculate categories with spending for the selected account
  const categories = useMemo(() => {
    return Object.keys(CATEGORY_BUDGETS).map(cat => {
      const catAmount = filteredTransactions
        .filter(tx => tx.category === cat && tx.type === 'outgoing')
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Get the color for the category using the helper function
      const colorClass = getCategoryColorClasses(cat).text;
      // Extract the color class (e.g., 'text-blue-600' -> 'blue-600')
      const color = colorClass.replace('text-', '').split(' ')[0];

      return {
        name: cat,
        amount: catAmount,
        budget: CATEGORY_BUDGETS[cat],
        label: CATEGORY_LABELS[cat] || cat,
        color: color
      };
    });
  }, [filteredTransactions]);
  
  // Handle account selection
  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    // In a real app, you might want to save the selected account preference
    // localStorage.setItem('selectedAccountId', account.id);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Feature`,
      description: `${action} functionality would be implemented here`,
    });
  };

  return (
    <main data-testid="dashboard" className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl sm:text-2xl font-bold">Accounts</h1>
      </div>

      {/* Account Cards */}
      <div data-testid="account-cards" className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {mockAccounts.map((account) => (
            <AccountCard
              key={account.id}
              balance={account.balance}
              currency={account.currency}
              accountName={account.displayName}
              accountType={account.type as 'checking' | 'savings' | 'investment' | 'credit'}
              availableBalance={account.availableBalance}
              isSelected={selectedAccount.id === account.id}
              color={account.color || 'blue'}
              icon={account.icon as IconType | undefined}
              onClick={() => handleAccountSelect(account)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Transactions Section */}
        <div className="flex-1">
          <div className="space-y-4">

            {/* Recent Transactions Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Transactions</h2>
              
              {/* Quick Actions - Clean horizontal action buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction('Transfer')}
                  className="h-8 px-3 text-xs"
                >
                  <ArrowUpRight className="h-3 w-3 mr-1.5" />
                  Upcoming
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction('Filter')}
                  className="h-8 px-3 text-xs"
                >
                  <Filter className="h-3 w-3 mr-1.5" />
                  Filter
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleQuickAction('Pay Bill')}
                  className="h-8 px-3 text-xs"
                >
                  <CreditCard className="h-3 w-3 mr-1.5" />
                  Pay
                </Button>
              </div>
            </div>
            
            {/* Transactions List */}
            <div data-testid="transactions-list" className="space-y-3 sm:space-y-4">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => handleTransactionClick(transaction)}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-foreground/70">
                    <p className="text-sm sm:text-base">No transactions found for this account.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Spending Insights - Responsive width */}
        <div data-testid="spending-insights" className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            <SpendingInsights 
              monthlyBudget={3000}
              spent={spent}
              currency="€"
              categories={categories}
              trend={{
                percentage: 12.5,
                direction: 'up'
              }}
              onViewDetails={() => handleQuickAction('View Spending Details')}
            />
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          transaction={selectedTransaction}
        />
      )}
    </main>
  );
};

export default Dashboard;