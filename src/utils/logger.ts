/**
 * Logger utility that disables debug logs in production
 * This wraps console methods to conditionally log based on environment
 */

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Define more specific type for console parameters
type LogParams = unknown[];

/**
 * Custom logger that disables debug logs in production
 */
const logger = {
    log: (...args: LogParams): void => {
        if (!isProduction) {
            console.log(...args);
        }
    },

    warn: (...args: LogParams): void => {
        console.warn(...args); // Always show warnings
    },

    error: (...args: LogParams): void => {
        console.error(...args); // Always show errors
    },

    info: (...args: LogParams): void => {
        if (!isProduction) {
            console.info(...args);
        }
    },

    debug: (...args: LogParams): void => {
        if (!isProduction) {
            console.debug(...args);
        }
    },

    // Special case for verbose logs - only shown in development
    verbose: (...args: LogParams): void => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[VERBOSE]', ...args);
        }
    }
};

export default logger; 