/**
 * Format a number as a price with currency symbol
 * @param price - The price to format
 * @param currency - The currency symbol to use (default: £)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = '£'): string => {
  return `${currency}${price.toLocaleString('en-GB')}`;
};

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format square footage with units
 * @param sqft - Square footage value
 * @returns Formatted square footage string
 */
export const formatSquareFootage = (sqft: number): string => {
  return `${sqft.toLocaleString('en-GB')} sq ft`;
}; 