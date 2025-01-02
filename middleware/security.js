const rateLimit = require('express-rate-limit');
const { logError } = require('../utils/logger');
const xss = require('xss');
const config = require('../global-variables.json');

// Testing mode detection
const isTestMode = config.testing && config.testing.enabled;

// Rate limiting configuration with test bypass
const createLimiter = (options) => {
    if (isTestMode && config.testing.disableRateLimit) {
        return (req, res, next) => next();
    }
    return rateLimit(options);
};

const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logError('Rate limit exceeded', { ip: req.ip });
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.'
        });
    }
});

const authLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logError('Auth rate limit exceeded', { ip: req.ip });
        res.status(429).json({
            error: 'Too many login attempts, please try again later.'
        });
    }
});

const linkLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Too many link operations, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logError('Link rate limit exceeded', { ip: req.ip });
        res.status(429).json({
            error: 'Too many link operations, please try again later.'
        });
    }
});

// API security middleware with test bypass
const secureAPI = (req, res, next) => {
    if (isTestMode && config.testing.disableAuthCheck) {
        return next();
    }
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    if (isTestMode && config.testing.disableSanitization) {
        return next();
    }

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key].trim());
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = xss(req.query[key].trim());
            }
        });
    }

    // Sanitize URL parameters
    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = xss(req.params[key].trim());
            }
        });
    }

    next();
};

// CSRF protection middleware with test bypass
const csrfProtection = (req, res, next) => {
    if (isTestMode && config.testing.disableCSRF) {
        return next();
    }

    if (req.method === 'GET') {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
};

// Generate CSRF token middleware
const generateCSRFToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    }
    // Make token available to templates
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    linkLimiter,
    secureAPI,
    sanitizeInput,
    csrfProtection,
    generateCSRFToken
};
