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

// Get available templates with their friendly names
const getTemplates = () => {
    try {
        const templatesDir = path.join(__dirname, '..', 'public', 'templates');
        const configPath = path.join(templatesDir, 'config.json');

        // Load template display names if config exists
        let templateConfig = {};
        if (fs.existsSync(configPath)) {
            templateConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        // Get all template folders
        return fs.readdirSync(templatesDir)
            .filter(file => {
                const stats = fs.statSync(path.join(templatesDir, file));
                // Only include directories and skip config.json
                return stats.isDirectory();
            })
            .map(folder => ({
                id: folder,
                name: templateConfig[folder]?.name || folder,
                author: templateConfig[folder]?.author || 'Unknown',
                description: templateConfig[folder]?.description || ''
            }));
    } catch (error) {
        console.error('Error reading templates:', error);
        return [{ id: 'default', name: 'Default Theme', author: 'Unknown', description: '' }];
    }
};

// Verify template exists
const templateExists = (templateId) => {
    try {
        const templatesDir = path.join(__dirname, '..', 'public', 'templates');
        const templatePath = path.join(templatesDir, templateId);
        return fs.existsSync(templatePath) && fs.statSync(templatePath).isDirectory();
    } catch (error) {
        console.error('Error checking template:', error);
        return false;
    }
};

// Dashboard route
router.get('/dashboard', requireLogin, (req, res) => {
    const userId = req.session.user.id;

    db.get('SELECT * FROM pages WHERE user_id = ?', [userId], (err, page) => {
        if (err) {
            logError('Failed to load page data', err);
            return res.redirect('/');
        }

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

// Update template route
router.post('/dashboard/update', requireLogin, (req, res) => {
    const { template } = req.body;
    const userId = req.session.user.id;

    // console.log('Updating template to:', template); // Debug log // commented out because ami doesnt like cluttered console lol

    // Validate template exists
    if (!templateExists(template)) {
        console.error('Invalid template requested:', template); // Debug log
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