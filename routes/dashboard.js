const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const fs = require('fs');
const path = require('path');
const { siteTitle, discordInvite, rootDomain } = require('../global-variables.json');
const { version } = require('../package.json');
const { logUser, logError } = require('../utils/logger');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Get available templates
const getTemplates = () => {
    try {
        const templatesDir = path.join(__dirname, '..', 'public', 'templates');
        return fs.readdirSync(templatesDir)
            .filter(file => fs.statSync(path.join(templatesDir, file)).isDirectory());
    } catch (error) {
        console.error('Error reading templates directory:', error);
        return ['default'];
    }
};

// User dashboard
router.get('/dashboard', requireLogin, (req, res) => {
    const userId = req.session.user.id;

    // Get user's page data
    db.get('SELECT * FROM pages WHERE user_id = ?', [userId], (err, page) => {
        if (err) {
            logError('Failed to load page data', err);
            return res.redirect('/');
        }

        // Get user's links
        db.all('SELECT * FROM links WHERE user_id = ? ORDER BY position', [userId], (err, links) => {
            if (err) {
                logError('Failed to load links', err);
                return res.redirect('/');
            }

            const templates = getTemplates();

            res.render('pages/dashboard/index', {
                siteTitle,
                discordInvite,
                rootDomain,
                version,
                page: page || { template: 'default' },
                links: links || [],
                templates,
                user: req.session.user
            });
        });
    });
});

// Update page settings
router.post('/dashboard/update', requireLogin, (req, res) => {
    const { template } = req.body;
    const userId = req.session.user.id;

    // Validate template exists
    const templates = getTemplates();
    if (!templates.includes(template)) {
        return res.status(400).send('Invalid template');
    }

    // Update or insert page settings
    db.run(`INSERT OR REPLACE INTO pages (user_id, template) VALUES (?, ?)`,
        [userId, template],
        (err) => {
            if (err) {
                logError('Failed to update page settings', err);
                return res.status(500).send('Failed to update settings');
            }

            logUser('Updated page template', req.session.user, { template });
            res.redirect('/dashboard');
        }
    );
});

module.exports = router;