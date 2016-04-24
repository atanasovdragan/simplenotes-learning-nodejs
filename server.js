// set up ======================================================================
// get all modules we need
var util = require('util')
var express  = require('express');
var expressValidator = require('express-validator');
var engine   = require('ejs-locals');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.disable('etag');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.use(expressValidator());

app.engine('ejs', engine);
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'naidb@#7823r$cj@#bfwh' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// use connect-flash for flash messages stored in session
app.use(flash());

// send error or successful messages to page if any
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.validation_errors = req.flash('validation_errors');
    next();
});


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server running on port ' + port);