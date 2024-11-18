const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const { siteTitle, discordInvite, rootDomain } = require('../global-variables.json');
const { version } = require('../package.json');

// Add debugging to admin middleware
const requireAdmin = (req, res, next) => {
    console.log('Admin check:', {
        session: req.session,
        user: req.session.user,
        isAdmin: req.session.user?.isAdmin
    });

    if (!req.session.user || !req.session.user.isAdmin) {
        console.log('Admin access denied');
        return res.status(403).redirect('/');
    }
    console.log('Admin access granted');
    next();
};

// Update query to include isAdmin in session
router.get('/dashboard/admin', requireAdmin, (req, res) => {
    db.all('SELECT id, username, isAdmin FROM users ORDER BY id', [], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
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

    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting user');
        }
        res.redirect('/dashboard/admin');
    });
});

// Toggle admin status
router.post('/dashboard/users/toggle-admin', requireAdmin, (req, res) => {
    const userId = req.body.userId;
    if (userId == req.session.user.id) {
        return res.status(400).send('Cannot modify your own admin status');
    }

    db.run('UPDATE users SET isAdmin = NOT isAdmin WHERE id = ?', [userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating user');
        }
        res.redirect('/dashboard/admin');
    });
});

module.exports = router;