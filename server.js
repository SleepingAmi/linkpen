const express = require('express');
const ejs = require('ejs');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const bodyParser = require('body-parser');
const { version } = require('./package.json')
const { rootDomain, hostPort, siteTitle, discordInvite, supabase_url, supabase_anon_key } = require('./global-variables.json')

const port = hostPort || 8800;

// kickstart express & supabase
const app = express();

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

const supabaseUrl = supabase_url;
const supabaseKey = supabase_anon_key;
const supabase = createClient(supabaseUrl, supabaseKey);

// listen to app
app.listen(port, function(){
    console.log('Online: ' + port);
})


app.get('/', async (req, res) => {
    res.render('pages/index',{
        siteTitle,
        discordInvite,
        rootDomain,
        version
    })
})

/*
    TO-DO:
        - CUSTOM REDIRECTS FOR /AUTH AND OTHER APP ROUTES
        - ACCOUNTS AND DATABASE
*/
app.get('/:id', async (req, res) => {
    /*if (req.params.id === 'auth') {
        res.render('pages/auth')
    } else {*/
        res.render('pages/index', {
            siteTitle,
            discordInvite,
            rootDomain,
            version
        })
    //}
})