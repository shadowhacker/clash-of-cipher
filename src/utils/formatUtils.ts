/**
 * Format a large number for display
 * Handles large numbers up to 99999999999999999 by using appropriate abbreviations
 * 
 * @param value The number to format
 * @param options Optional configuration
 * @returns Formatted string representation of the number
 */
export function formatLargeNumber(value: number, options: {
  useAbbreviations?: boolean, // Whether to use K, M, B, T abbreviations for large numbers
  decimalPlaces?: number,     // Number of decimal places for abbreviated values
  alwaysShowDecimals?: boolean, // Whether to always show decimals even if they're zeros
} = {}): { displayValue: string, fullValue: string } {
  // Default options
  const {
    useAbbreviations = true,
    decimalPlaces = 1,
    alwaysShowDecimals = false
  } = options;

  // Format the full value with commas
  const fullValue = value.toLocaleString();
  
  // If not using abbreviations, just return the full value with commas
  if (!useAbbreviations || value < 1000) {
    return { displayValue: fullValue, fullValue };
  }

  // Define abbreviation tiers
  const abbreviations = [
    { threshold: 1e15, symbol: 'Q' },  // quadrillion
    { threshold: 1e12, symbol: 'T' },  // trillion
    { threshold: 1e9, symbol: 'B' },   // billion
    { threshold: 1e6, symbol: 'M' },   // million
    { threshold: 1e3, symbol: 'K' }    // thousand
  ];

  // Find the appropriate abbreviation
  const tier = abbreviations.find(abbr => value >= abbr.threshold);
  
  if (!tier) {
    return { displayValue: fullValue, fullValue };
  }

  // Calculate the abbreviated value
  const abbreviated = value / tier.threshold;
  
  // Format with specified decimal places
  let displayValue: string;
  
  if (alwaysShowDecimals) {
    // Always show the specified number of decimal places
    displayValue = abbreviated.toFixed(decimalPlaces);
  } else {
    // Only show decimal places if they're not all zeros
    const fixedValue = abbreviated.toFixed(decimalPlaces);
    const intValue = Math.floor(abbreviated);
    
    if (parseFloat(fixedValue) === intValue) {
      // No significant decimal places, show as integer
      displayValue = intValue.toString();
    } else {
      // Has significant decimal places
      displayValue = fixedValue;
    }
  }
  
  // Add the abbreviation symbol
  displayValue += tier.symbol;
  
  return { displayValue, fullValue };
} 