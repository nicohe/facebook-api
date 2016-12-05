var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieSession = require('cookie-session');
var FacebookStrategy = require("passport-facebook").Strategy;
var graph = require('fbgraph');
var User = require('./models/user');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cookieSession({ keys: ['asasdasda', 'asd12s']}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');



passport.use(new FacebookStrategy({
    clientID:'',
    clientSecret:'',
    callbackURL:'http://localhost:8000/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, cb) {
        
        User.findOrCreate({uid: profile.id}, 
                          {name: profile.displayName, provider: 'facebook', accessToken: accessToken},
                          function(err, user){
                            cb(null, user);
                          });
    }
));

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(user,done){
    done(null, user)
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['publish_actions', 'user_friends']}));

app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {failureRedirect: '/'}), 
    function (req, res) {
        console.log(req.session);
        res.redirect('/');
    });

app.get('/friends', function(req, res){
    graph.setAccessToken(req.session.passport.user.accessToken);
   
    graph.get("/me/friends", function (err, graphResponse){
        var ids = graphResponse.data.map(function(el){
            return el.id;
        });

        User.find({
        'uid': {
            $in: ids
            }
        }, function (err, users) {
            res.render('friends', {users: users});
        });
    });
});

app.get('/auth/close', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/', function(req, res) {

    if(typeof req.session.passport == "undefined" || !req.session.passport.user){
        res.render('index');
    }
     else {
        res.render("home");
    }
});

app.post("/logros", function(req,res){
    var logro = req.body.logro;

    graph.setAccessToken(req.session.passport.user.accessToken);

    graph.post("/feed", {message: logro}, function(err, graphResponse){
        console.log(graphResponse);
        res.redirect("/");
    })
})


app.listen(8000, function(){
    console.log("Estamos listos en el puerto 8000");
});
