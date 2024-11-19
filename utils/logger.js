const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Toggle for console logging
const ENABLE_CONSOLE_LOGGING = false; // Easy toggle for console output

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define custom format
const customFormat = winston.format.printf(info => {
    let logMessage = `${info.timestamp} [${info.level.toUpperCase()}]`;
    if (info.type) logMessage += ` [${info.type}]`;
    if (info.user) logMessage += ` [User: ${info.user}]`;
    logMessage += `: ${info.message}`;
    if (info.details) logMessage += ` - ${JSON.stringify(info.details)}`;
    return logMessage;
});

// Base transport format
const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
);

// Create loggers with conditional console transport
const createLogger = (filename, level = 'info') => {
    const transports = [
        new winston.transports.File({
            filename: path.join(logsDir, filename),
            level
        })
    ];

    // Add console transport if enabled
    if (ENABLE_CONSOLE_LOGGING) {
        transports.push(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        );
    }

    return winston.createLogger({
        format: baseFormat,
        transports
    });
};

// Create separate loggers for each concern
const authLogger = createLogger('auth.log');
const adminLogger = createLogger('admin.log');
const userLogger = createLogger('user.log');
const errorLogger = createLogger('error.log', 'error');

// Helper functions
const logAdmin = (message, adminUser, details = null) => {
    adminLogger.info({
        type: 'ADMIN',
        message,
        user: adminUser?.username || 'Unknown',
        details
    });
};

const logUser = (message, user, details = null) => {
    userLogger.info({
        type: 'USER',
        message,
        user: user?.username || 'Unknown',
        details
    });
};

const logAuth = (message, username, details = null) => {
    authLogger.info({
        type: 'AUTH',
        message,
        user: username || 'Unknown',
        details
    });
};

const logError = (message, error = null) => {
    errorLogger.error({
        type: 'ERROR',
        message,
        details: error ? (error.stack || error.message || error) : null
    });
};

module.exports = { logAdmin, logUser, logAuth, logError };