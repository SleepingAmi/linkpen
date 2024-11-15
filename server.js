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
    cookie: { secure: false }   // Set to false if not using HTTPS
}));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache");
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/api', require('./routes/api'));

// listen to app
app.listen(port, function(){
    console.log('Online: ' + port);
})

// GET / (landing page)
app.get('/', async (req, res) => {
    res.render('pages/index',{
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
const filteredEndpoints = ['auth'];

// GET any :id
app.get('/:id', async (req, res) => {
    if (filteredEndpoints.includes(req.params.id)) {
        res.render(`pages/${req.params.id}`, {
            siteTitle,
            version,
            rootDomain,
            isPublic,
            discordInvite
        })
    } else {
        res.render('pages/template', {
            siteTitle,
            discordInvite,
            rootDomain,
            version
        })
    }
})