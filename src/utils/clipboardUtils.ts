/**
 * Utility functions for clipboard operations with fallbacks
 */

// Check if the Clipboard API is available
const isClipboardApiSupported = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' && 
    navigator.clipboard && 
    typeof navigator.clipboard.writeText === 'function'
  );
};

// Create a temporary textarea element to copy text
const fallbackCopyTextToClipboard = (text: string): boolean => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // Select and copy
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
};

/**
 * Copy text to clipboard with fallback for browsers without Clipboard API
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Use Clipboard API if available
  if (isClipboardApiSupported()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
      // Fall back to execCommand
      return fallbackCopyTextToClipboard(text);
    }
  } else {
    // Use fallback method
    return fallbackCopyTextToClipboard(text);
  }
}; 