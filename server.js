var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var mailer = require('./mailer');
var database = require('./database');

var db;

/* 
*  Get the app info here because I don't want this to be on GitHub
*  Ask Dave for this information and don't upload the file to GitHub...
*  I will deny your pull request if you have this info in your directory.
*/
fs = require('fs');
var facebookAppInfo = fs.readFileSync('FacebookAppInfo.txt', 'utf8');
facebookAppInfo = facebookAppInfo.split('\n');
/*
* Don't forget to change the callback URL you idiot.
*/
// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: facebookAppInfo[0],
    clientSecret: facebookAppInfo[1].toString(),
    //This is important for Valid OAuth redirect URIs on Facebook Developers webpage
    callbackURL: 'http://localhost:3000/login/facebook/return',
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
app.use(require('body-parser').json({ extended: true }));
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

//This requires an event object without the idNum, thats generated by this function...
app.post("/eventServices/createEvent",
  //require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var event = req.body;
    database.insertEvent(event, function(){
          res.statusCode = 200;
          res.send("Successfully added Event");
    });
  });

//This route requires an object to be sent with an idNum field and an eventCreator field.
//If both of these fields dont match a single entry in the array its not getting deleted.
app.post("/eventServices/deleteEvent",
  //require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var deleteObj = req.body;
    database.deleteEvent(deleteObj, function(){
      res.statusCode=200;
      res.send("Successfully deleted Event");
    });
    
  });

  //Return All Events that currently exist in the system.
  app.get("/eventServices/getAllEvents",
    //require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){

    res.statusCode = 200;
    var obj = database.showAllEvents(function(results){
      //console.log(results);
      res.json(results);
    });

  });

  //This service requires an object with an idNum and email field.
  //If the user is already going to this event then don't add them again.
  app.post("/userServices/addUserToEvent",
    //require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){

    var userAddObj = req.body;

    database.addUserToEvent(userAddObj, function(results){
      if(results)
      {
        database.getEvent(userAddObj, function(results){
          //console.log(results)
          mailer.sendAddUserNotification(results, userAddObj);
          res.statusCode=200;
          res.json({alreadyJoined: false});
        });
      }
      else
      {
        res.statusCode=200;
        res.json({alreadyJoined: true});
      }
    })

  });

  app.post("/userServices/removeUserFromEvent",
    //require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){

    var deleteObj = req.body;

    database.removeUserFromEvent(deleteObj, function(results){
      res.statusCode=200;
      res.send("User Removed Successfully From Event");
    })

  });

  app.post("/userServices/getAllUsersForEvent",
    //require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){

    var allUsers = req.body;
    console.log(allUsers);

    database.getAllUsersForEvent(allUsers, function(results){
      res.statusCode=200;
      res.json(results);
    })

  });

  app.post("/eventServices/getAllEventInfo", 
  function(req, res){
      var allData = req.body;
      console.log(allData);

      database.getAllEventInfo(allData, function(results){
        res.statusCode = 200;
        res.json(results);
      })
  });

app.listen(3000, '0.0.0.0', function() {
  database.connect();
  console.log('Listening to port:  ' + 3000);
});