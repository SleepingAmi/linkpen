const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in');
    }
    next();
};

// Add new link
router.post('/add', requireLogin, async (req, res) => {
    const { title, url } = req.body;
    const userId = req.session.user.id;

    // Get the highest position for this user
    db.get('SELECT MAX(position) as maxPos FROM links WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        const position = (row.maxPos || 0) + 1;

        db.run('INSERT INTO links (user_id, title, url, position) VALUES (?, ?, ?, ?)',
            [userId, title, url, position],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error adding link');
                }
                res.redirect('/' + req.session.user.username);
            }
        );
    });
});

// Update link
router.post('/update', requireLogin, (req, res) => {
    const { linkId, title, url } = req.body;
    const userId = req.session.user.id;

    // Verify link belongs to user
    db.get('SELECT * FROM links WHERE id = ? AND user_id = ?', [linkId, userId], (err, link) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (!link) {
            return res.status(403).send('Unauthorized');
        }

        db.run('UPDATE links SET title = ?, url = ? WHERE id = ? AND user_id = ?',
            [title, url, linkId, userId],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error updating link');
                }
                res.redirect('/' + req.session.user.username);
            }
        );
    });
});

// Delete link
router.post('/delete', requireLogin, (req, res) => {
    const { linkId } = req.body;
    const userId = req.session.user.id;

    db.run('DELETE FROM links WHERE id = ? AND user_id = ?',
        [linkId, userId],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting link');
            }
            res.redirect('/' + req.session.user.username);
        }
    );
});

router.post('/reorder', requireLogin, (req, res) => {
    const { links } = req.body; // Array of {id, position}
    const userId = req.session.user.id;

    // Start a transaction to ensure all updates complete
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let completedUpdates = 0;
        const totalUpdates = links.length;

        links.forEach(({ id, position }) => {
            db.run(
                'UPDATE links SET position = ? WHERE id = ? AND user_id = ?',
                [position, id, userId],
                (err) => {
                    if (err) {
                        console.error('Error updating position:', err);
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to update positions' });
                    }

                    completedUpdates++;
                    if (completedUpdates === totalUpdates) {
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Failed to commit changes' });
                            }
                            res.json({ success: true });
                        });
                    }
                }
            );
        });
    });
});

module.exports = router;