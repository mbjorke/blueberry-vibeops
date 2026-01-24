/**
 * Fintech Components Library
 * 
 * A collection of specialized fintech components built for modern banking interfaces.
 * These components follow the established design system and provide core functionality
 * for financial applications.
 * 
 * @see ../DESIGN_SYSTEM.md for complete documentation
 */

// Core fintech components
export { AccountCard } from './AccountCard';
export { TransactionItem } from './TransactionItem';
export { TransactionDetailsModal } from './TransactionDetailsModal';
export { SpendingInsights } from './SpendingInsights';

// Type exports
export type { Transaction } from './types';

/**
 * Component Categories:
 * 
 * Account Management:
 * - AccountCard: Main account balance display with quick actions
 * 
 * Transaction Management:
 * - TransactionItem: Individual transaction display with categorization
 * 
 * Actions & Navigation:
 * - QuickActions: Grid of common financial action buttons
 * 
 * Analytics & Insights:
 * - SpendingInsights: Budget tracking and category breakdown
 */