/**
 * Logger utility that disables debug logs in production
 * This wraps console methods to conditionally log based on environment
 */

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Define more specific type for console parameters
type LogParams = unknown[];

// Helper to get caller location from stack trace
function getCallerLocation(): string | undefined {
    const err = new Error();
    if (err.stack) {
        const stackLines = err.stack.split('\n');
        // Find the first stack frame outside of logger.ts
        const callerLine = stackLines.find(
            (line) => !line.includes('logger.ts') && line.includes('at ')
        );
        if (callerLine) {
            return callerLine.trim().replace(/^at /, '');
        }
    }
    return undefined;
}

/**
 * Custom logger that disables debug logs in production
 */
const logger = {
    log: (...args: LogParams): void => {
        if (!isProduction) {
            const location = getCallerLocation();
            if (location) {
                console.log(`[Log at ${location}]`, ...args);
            } else {
                console.log(...args);
            }
        }
    },

    warn: (...args: LogParams): void => {
        const location = getCallerLocation();
        if (location) {
            console.warn(`[Warn at ${location}]`, ...args);
        } else {
            console.warn(...args);
        }
    },

    error: (...args: LogParams): void => {
        const location = getCallerLocation();
        if (location) {
            console.error(`[Error at ${location}]`, ...args);
        } else {
            console.error(...args);
        }
    },

    info: (...args: LogParams): void => {
        if (!isProduction) {
            const location = getCallerLocation();
            if (location) {
                console.info(`[Info at ${location}]`, ...args);
            } else {
                console.info(...args);
            }
        }
    },

    debug: (...args: LogParams): void => {
        if (!isProduction) {
            const location = getCallerLocation();
            if (location) {
                console.debug(`[Debug at ${location}]`, ...args);
            } else {
                console.debug(...args);
            }
        }
    },

    // Special case for verbose logs - only shown in development
    verbose: (...args: LogParams): void => {
        if (process.env.NODE_ENV === 'development') {
            const location = getCallerLocation();
            if (location) {
                console.log(`[VERBOSE at ${location}]`, ...args);
            } else {
                console.log('[VERBOSE]', ...args);
            }
        }
    }
};

export default logger; 