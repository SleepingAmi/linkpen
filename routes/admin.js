const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const { siteTitle, discordInvite, rootDomain } = require('../global-variables.json');
const { version } = require('../package.json');
const { logAdmin, logError } = require('../utils/logger');

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        logAdmin('Unauthorized access attempt', req.session.user);
        return res.redirect('/');
    }
    next();
};

// Admin dashboard
router.get('/dashboard/admin', requireAdmin, (req, res) => {
    db.all('SELECT id, username, isAdmin FROM users ORDER BY id', [], (err, users) => {
        if (err) {
            logError('Failed to load users', err);
            return res.redirect('/');
        }

        res.render('pages/admin/dashboard', {
            siteTitle,
            discordInvite,
            rootDomain,
            version,
            users,
            loggedInUser: req.session.user
        });
    });
});

// Delete user
router.post('/dashboard/users/delete', requireAdmin, (req, res) => {
    const userId = req.body.userId;
    if (userId == req.session.user.id) {
        return res.status(400).send('Cannot delete your own account');
    }

    db.get('SELECT username, isAdmin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            logError('Database error while fetching user', err);
            return res.redirect('/dashboard/admin');
        }

        const newStatus = user.isAdmin ? 0 : 1;
        db.run('UPDATE users SET isAdmin = ? WHERE id = ?', [newStatus, userId], (err) => {
            if (err) {
                logError('Database error while updating admin status', err);
                return res.redirect('/dashboard/admin');
            }

            logAdmin(`Changed admin status for ${user.username} to ${newStatus ? 'admin' : 'user'}`, req.session.user);
            res.redirect('/dashboard/admin');
        });
    });
});

// Delete user
router.post('/dashboard/users/delete', requireAdmin, (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.redirect('/dashboard/admin');
    }

    if (userId == req.session.user.id) {
        return res.redirect('/dashboard/admin');
    }

    // Get user info before deletion
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            console.error(err);
            return res.redirect('/dashboard/admin');
        }

        // Delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/dashboard/admin');
            }

            res.redirect('/dashboard/admin');
        });
    });
});

module.exports = router;