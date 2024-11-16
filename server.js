const express = require('express');
const ejs = require('ejs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const { version } = require('./package.json')
const { rootDomain, hostPort, siteTitle, discordInvite, database_key, isPublic } = require('./global-variables.json')

const port = hostPort || 8800;

// kickstart express & database
const app = express();

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating users table:', err.message);
    } else {
        console.log('users table is ready.');
    }
});

const session = require('express-session');

app.use(session({
    secret: database_key,       // Replace with a strong, random secret key
    resave: false,              // Avoid resaving unchanged sessions
    saveUninitialized: true,    // Save uninitialized sessions
    cookie: { secure: true }   // Set to false if not using HTTPS
}));

// CORS and cache headers middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

// User session and locals middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isPublic = isPublic;
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Route handlers
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/auth'));

// GET / (landing page)
app.get('/', async (req, res) => {
    res.render('pages/index', {
        siteTitle,
        discordInvite,
        rootDomain,
        version
    })
})

/* @endpoint filter
    Endpoints to filter out, as the below implementation will otherwise find any matching record in the database.
    **WARNING!!!**
    This does not filter out said endpoints from being registered against your database!
    Adding any endpoints to the filter can cause user pages to be unreachable!
        Modify at your own risk, but with caution.
            - SleepingAmi
*/

// Special routes that should be checked before user pages
const specialRoutes = ['about'];

// GET any :id
app.get('/:id', async (req, res) => {
    // First check if this is a special route
    if (specialRoutes.includes(req.params.id)) {
        return res.render(`pages/${req.params.id}`, {
            siteTitle,
            version,
            rootDomain,
            isPublic,
            discordInvite
        });
    }

    // If not a special route, check if it's a user page
    db.get('SELECT * FROM users WHERE username = ?', [req.params.id], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (user) {
            // This is a user page
            res.render('pages/template', {
                siteTitle,
                discordInvite,
                rootDomain,
                version,
                user
            });
        } else {
            // Not a user page, send 404
            res.status(404).render('pages/404', {
                siteTitle,
                discordInvite,
                rootDomain,
                version
            });
        }
    });
});

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// Handle server errors
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