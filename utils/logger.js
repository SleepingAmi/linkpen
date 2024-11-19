const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define custom format
const customFormat = winston.format.printf(({ timestamp, level, type, message, user, details }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]`;
    if (type) logMessage += ` [${type}]`;
    if (user) logMessage += ` [User: ${user}]`;
    logMessage += `: ${message}`;
    if (details) logMessage += ` - ${JSON.stringify(details)}`;
    return logMessage;
});

// Create logger with separate files per concern
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        // Auth specific logs
        new winston.transports.File({
            filename: path.join(logsDir, 'auth.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        // Only admin actions
        new winston.transports.File({
            filename: path.join(logsDir, 'admin.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        // Only user actions
        new winston.transports.File({
            filename: path.join(logsDir, 'user.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        // Application errors
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        })
    ]
});

// Helper functions with better separation
const logAdmin = (message, adminUser, details = null) => {
    logger.info({
        type: 'ADMIN',
        message,
        user: adminUser?.username || 'Unknown',
        details
    });
};

const logUser = (message, user, details = null) => {
    logger.info({
        type: 'USER',
        message,
        user: user?.username || 'Unknown',
        details
    });
};

const logAuth = (message, username, details = null) => {
    logger.info({
        type: 'AUTH',
        message,
        user: username || 'Unknown',
        details
    });
};

const logError = (message, error = null) => {
    logger.error({
        type: 'ERROR',
        message,
        details: error ? (error.stack || error.message || error) : null
    });
};

// Development console logging
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = {
    logAdmin,   // For admin actions only
    logUser,    // For regular user actions
    logAuth,    // For login/register/logout
    logError    // For application errors
};