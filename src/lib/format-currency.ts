/**
 * Formats a number as a currency string
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'GBP', 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback to basic formatting
    return `${currency || '£'}${amount.toFixed(2)}`;
  }
}
