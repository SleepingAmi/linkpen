const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');  // Add this
const { rootDomain } = require('../global-variables.json');
const config = require(path.join(__dirname, '..', 'config.js'));  // Fix the import
const sqlite3 = require('sqlite3').verbose();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
const db = new sqlite3.Database('./database.sqlite');

// Validation functions
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return 'Username is required';
    }

    // Check reserved usernames
    if (config.reservedUsernames.includes(username.toLowerCase())) {
        return 'This username is not available';
    }

    // Check length and format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
        return 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens';
    }

    return null;
}

function validatePassword(password) {
    const reqs = config.passwordRequirements;

    if (!password) {
        return 'Password is required';
    }

    if (password.length < reqs.minLength) {
        return `Password must be at least ${reqs.minLength} characters long`;
    }

    if (password.length > reqs.maxLength) {
        return `Password cannot be longer than ${reqs.maxLength} characters`;
    }

    if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }

    if (reqs.requireLowercase && !/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }

    if (reqs.requireNumbers && !/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }

    return null;
}

router.get('/', async (req, res, next) => {
    res.send({ "healthCheck": "pass", "rootDomain": rootDomain, "online": true });
})

// Sign Up New Users
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    // Validate inputs
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).send(usernameError);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).send(passwordError);
    }

    try {
        // Check if username exists (case-insensitive)
        db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username], async (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Database error.');
            }

            if (row) {
                return res.status(400).send('Username already exists.');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send('Error creating user.');
                }

                // Get the new user
                db.get('SELECT * FROM users WHERE username = ?', [username], (err, newUser) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).send('Error retrieving user data.');
                    }

                    // Set session
                    req.session.user = {
                        id: newUser.id,
                        username: newUser.username
                    };

                    req.session.save((err) => {
                        if (err) {
                            console.error('Session save error:', err);
                            return res.status(500).send('Error saving session.');
                        }
                        res.redirect(`/${username}`);
                    });
                });
            });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error.');
    }
});

// Login Existing Users
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required fields.');
    }

    try {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Database error.');
            }

            if (!row) {
                return res.status(400).send('Invalid username or password.');
            }

            const isPasswordCorrect = await bcrypt.compare(password, row.password);
            if (!isPasswordCorrect) {
                return res.status(400).send('Invalid username or password.');
            }

            // Set session data with explicit save
            req.session.user = {
                id: row.id,
                username: row.username
            };

            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Error saving session');
                }
                console.log('Session saved:', req.session); // Debug log
                res.redirect(`/${row.username}`);
            });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error.');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    // For debugging
    console.log('Logout called. Session before:', req.session);

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }

        // Clear the cookie
        res.clearCookie('connect.sid');

        console.log('Session destroyed successfully');

        // Redirect to home page
        res.redirect('/');
    });
});

// Make sure to export the router!
module.exports = router;