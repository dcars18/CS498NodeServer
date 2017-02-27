var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var mailer = require('./mailer');
/*
*
*
* Don't forget to change the callback URL you fucking idiot.
*
*
*/
// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: 1037528376351199,
    clientSecret: '28ab4929a0970fcc8411522e5f3675ba',
    //This is important for Valid OAuth redirect URIs on Facebook Developers webpage
    callbackURL: 'http://10.20.9.119:3000/login/facebook/return',
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email']}));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  //This will bring the user object with you across pages...
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    mailer.sendMail(req.user.emails[0].value);
    console.log(req.user.emails[0].value);
    res.render('profile', { user: req.user });
  });
  
app.get('/Hello',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('Hello', {user: req.user});
  });  

app.listen(3000, '0.0.0.0', function() {
  console.log('Listening to port:  ' + 3000);
  console.log('Log message');
  //Dave was here
});
