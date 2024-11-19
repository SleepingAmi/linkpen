const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const { rootDomain, siteTitle, discordInvite, isPublic } = require('../global-variables.json');
const { version } = require('../package.json');
const config = require(path.join(__dirname, '..', 'config.js'));
const sqlite3 = require('sqlite3').verbose();
const { logAuth, logError } = require('../utils/logger');

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
        return res.render('pages/auth/register', {
            siteTitle,
            discordInvite,
            rootDomain,
            version,
            isPublic,
            error: usernameError
        });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        logAuth('Registration failed - invalid password', username);
        return res.redirect('/register');
    }

    try {
        // Check if username exists (case-insensitive)
        db.get('SELECT id, username, isAdmin FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                logError('Database error during registration', err);
                return res.redirect('/register');
            }

            if (row) {
                logAuth('Registration failed - username taken', username);
                return res.render('pages/auth/register', {
                    siteTitle,
                    rootDomain,
                    discordInvite,
                    version,
                    isPublic,
                    error: 'This username is already taken'
                });
            }

            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert the new user
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
                    if (err) {
                        logError('Error creating user', err);
                        return res.redirect('/register');
                    }

                    // Get the new user - include isAdmin in the SELECT
                    db.get('SELECT id, username, isAdmin FROM users WHERE username = ?', [username], (err, newUser) => {
                        if (err) {
                            logError('Error retrieving new user data', err);
                            return res.redirect('/login');
                        }

                        // Set session
                        req.session.user = {
                            id: newUser.id,
                            username: newUser.username,
                            isAdmin: newUser.isAdmin === 1
                        };

                        req.session.save((err) => {
                            if (err) {
                                logError('Session save error', err);
                                return res.redirect('/login');
                            }
                            logAuth('Successful registration', username);
                            res.redirect(`/${username}`);
                        });
                    });
                });
            } catch (hashError) {
                logError('Password hashing error', hashError);
                return res.redirect('/register');
            }
        });
    } catch (error) {
        logError('Unexpected error during registration', error);
        return res.redirect('/register');
    }
});

// Login Existing Users
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        logAuth('Login attempt with missing credentials', null);
        return res.render('pages/auth/login', {
            siteTitle,
            discordInvite,
            rootDomain,
            version,
            isPublic,
            error: 'Username and password are required'
        });
    }

    try {
        db.get('SELECT id, username, password, isAdmin FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                logError('Database error during login', err);
                return res.redirect('/login');
            }

            // User not found
            if (!row) {
                logAuth('Login attempt for non-existent user', username);
                return res.render('pages/auth/login', {
                    siteTitle,
                    discordInvite,
                    rootDomain,
                    version,
                    isPublic,
                    error: 'Invalid username or password'
                });
            }

            // Check password
            try {
                const isPasswordCorrect = await bcrypt.compare(password, row.password);
                if (!isPasswordCorrect) {
                    logAuth('Failed login attempt - incorrect password', username);
                    return res.render('pages/auth/login', {
                        siteTitle,
                        rootDomain,
                        discordInvite,
                        version,
                        isPublic,
                        error: 'Invalid username or password'
                    });
                }

                // Login successful
                req.session.user = {
                    id: row.id,
                    username: row.username,
                    isAdmin: row.isAdmin === 1
                };

                // Save session before redirect
                req.session.save((err) => {
                    if (err) {
                        logError('Session save error during login', err);
                        return res.redirect('/login');
                    }

                    logAuth('Successful login', username, { isAdmin: row.isAdmin === 1 });
                    res.redirect(`/${username}`);
                });
            } catch (bcryptError) {
                logError('Password comparison error', bcryptError);
                return res.redirect('/login');
            }
        });
    } catch (error) {
        logError('Unexpected error during login', error);
        return res.redirect('/login');
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