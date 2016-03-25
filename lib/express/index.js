var express = require('express')
, http = require('http')
, bodyParser = require('body-parser')
, LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
, passport = require('passport')
, config = require('../configuration')
, db = require('../db')
, heartbeat = require('../routes/heartbeat')
, project = require('../routes/project')
, linkedin = require('../routes/linkedin')
, notFound = require('../middleware/notFound')
, app = express();

passport.use(new LinkedInStrategy({
    clientID: config.get('linkedin:clientid'),
    clientSecret: config.get('linkedin:secret'),
    callbackURL: config.get('linkedin:redirecturi'),
    scope: ['r_emailaddress', 'r_basicprofile'],
}, function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    console.log('verification done : ', accessToken);
    process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
}));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(bodyParser.json());

app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', config.get("express:port"));
app.use(require('connect-logger')({ immediate: true }));
app.get('/heartbeat', heartbeat.index);
app.post('/project', project.post);
app.get('/project/:id', project.get);
app.put('/project/:id', project.put);
app.delete('/project/:id', project.del);
app.get('/project', project.all);
app.get('/linkedin/auth/', linkedin.createnew);
app.post('/linkedin/auth/', linkedin.post);
//app.get('/linkedin/auth/callback', linkedin.authcallback);

app.get('/auth/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE'  }),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
});
app.get('/linkedin/auth/callback', passport.authenticate('linkedin', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.use(notFound.index);
http.createServer(app).listen(app.get('port'));
module.exports = app;
