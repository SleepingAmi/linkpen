const express = require('express');
const ejs = require('ejs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { version } = require('./package.json')
const { rootDomain, hostPort, siteTitle, discordInvite, database_key, isPublic } = require('./global-variables.json')
const cookieParser = require('cookie-parser');

const port = hostPort || 8800;

// Initialize Express
const app = express();

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    // Create users table if it doesn't exist (without isAdmin initially)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('users table is ready.');

            // Add isAdmin column if it doesn't exist
            db.run(`PRAGMA table_info(users)`, (err, rows) => {
                if (err) {
                    console.error('Error checking table info:', err);
                    return;
                }

                // Check if isAdmin column exists
                db.get(`SELECT * FROM pragma_table_info('users') WHERE name='isAdmin'`, (err, row) => {
                    if (err) {
                        console.error('Error checking for isAdmin column:', err);
                        return;
                    }

                    const setupAdmin = () => {
                        // Check if there are any users and set first one as admin
                        db.get('SELECT COUNT(*) as count FROM users', [], (err, countRow) => {
                            if (err) {
                                console.error('Error counting users:', err);
                                return;
                            }
                            if (countRow.count > 0) {
                                db.run('UPDATE users SET isAdmin = 1 WHERE id = 1', (err) => {
                                    if (err) {
                                        console.error('Error setting admin:', err);
                                    } else {
                                        console.log('Set first user as admin');
                                    }
                                });
                            }
                        });
                    };

                    if (!row) {
                        // Add isAdmin column
                        db.run(`ALTER TABLE users ADD COLUMN isAdmin BOOLEAN DEFAULT 0`, (err) => {
                            if (err) {
                                console.error('Error adding isAdmin column:', err);
                                return;
                            }
                            console.log('Added isAdmin column');
                            setupAdmin();
                        });
                    } else {
                        // Column exists, just ensure first user is admin
                        setupAdmin();
                    }
                });
            });
        }
    });

    // Links table
    db.run(`CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        position INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('Error creating links table:', err.message);
        } else {
            console.log('links table is ready.');
        }
    });
});

app.use(cookieParser());

// Session configuration
app.use(session({
    secret: database_key,
    resave: true,           // Changed to true
    saveUninitialized: false,
    name: 'connect.sid',    // Explicit cookie name
    cookie: {
        secure: false,      // Set to false for HTTP
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        sameSite: 'lax'    // Added for security
    },
    rolling: true          // Refresh session with each request
}));

// Add consent route
app.post('/cookie-consent', (req, res) => {
    res.cookie('cookieConsent', 'true', {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (idk)
        httpOnly: true,
        secure: rootDomain.startsWith('https'),
        sameSite: 'strict'
    });
    res.redirect(req.get('referer') || '/');
});

const requireCookieConsent = (req, res, next) => {
    if (!req.cookies.cookieConsent) {
        return res.redirect('/?requireConsent=true');
    }
    next();
};

app.use('/login', requireCookieConsent);
app.use('/register', requireCookieConsent);

app.use((req, res, next) => {
    // Refresh session expiry
    if (req.session.user) {
        req.session.touch();
    }
    next();
});

// Basic middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Headers middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

// Session debug middleware
// app.use((req, res, next) => {
//     console.log('Session:', req.session);
//     console.log('User:', req.session.user);
//     next();
// });

// Make user data available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isPublic = isPublic;
    next();
});

// Cookie notice middleware
app.use((req, res, next) => {
    res.locals.showCookieNotice = !req.cookies?.cookieConsent;
    next();
});

// Import route handlers
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const linksRouter = require('./routes/links');
const adminRouter = require('./routes/admin');

// Apply API routes
app.use('/api', apiRouter);
app.use('/', authRouter);
app.use('/api/links', linksRouter);
app.use('/', adminRouter);

// Landing page route
app.get('/', (req, res) => {
    res.render('pages/index', {
        siteTitle,
        discordInvite,
        rootDomain,
        version,
        isPublic,
        requireConsent: req.query.requireConsent === 'true'
    });
});

// Apply auth routes
app.use('/', authRouter);

/* @endpoint filter
    Endpoints to filter out, as the below implementation will otherwise find any matching record in the database.
    **WARNING!!!**
    This does not filter out said endpoints from being registered against your database!
    Adding any endpoints to the filter can cause user pages to be unreachable!
        Modify at your own risk, but with caution.
            - SleepingAmi
*/

// User pages and special routes as catch-all
app.get('/:id', async (req, res) => {
    // Special routes like 'about'
    if (['about'].includes(req.params.id)) {
        return res.render(`pages/${req.params.id}`, {
            siteTitle,
            version,
            rootDomain,
            isPublic,
            discordInvite
        });
    }

    // Check if it's a user page
    db.get('SELECT * FROM users WHERE username = ?', [req.params.id], (err, pageUser) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (pageUser) {
            // Get user's links
            db.all('SELECT * FROM links WHERE user_id = ? AND is_active = 1 ORDER BY position', [pageUser.id], (err, links) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error');
                }

                // Render page with user and their links
                res.render('pages/template', {
                    siteTitle,
                    discordInvite,
                    rootDomain,
                    version,
                    pageUser,
                    loggedInUser: req.session.user,
                    links: links || []
                });
            });
        } else {
            // Not a user page, send 404
            res.status(404).render('pages/404', {
                siteTitle,
                discordInvite,
                rootDomain,
                version,
                isPublic
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/404', {
        siteTitle,
        discordInvite,
        rootDomain,
        version,
        error: err.message
    });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling for server
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            console.error(`Port ${port} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${port} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});
