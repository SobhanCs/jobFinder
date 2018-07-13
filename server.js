// server.js


// set up ======================================================================
// get all the tools we need

var express      = require('express');
var mongoose     = require('mongoose');
// var port         = process.env.PORT || 8580;
var passport     = require('passport');
var flash        = require('connect-flash');
// var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var app          = express();
var router       = express.Router();
var jobModel     = require('./app/models/jobModel');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
// app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
// app.use(bodyParser('application/json')); // get information from html forms
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({
    type: 'application/json'
})); // parse application/json

// set the view engine to ejs
app.set('view engine', 'ejs');

app.set('views', 'views');


// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



app.use(express.static(__dirname + '/public'));


mongoose.connect("mongodb://localhost:27017/jobteam", function (err) {
    if (err) throw err;
    console.log("mongodb connected!");
});

app.use('/', router);
// use res.render to load up an ejs view file

// homepage page 
router.get('/', function (req, res) {
    res.render('index');
});

// all page 
router.get('/all/:page', function (req, res) {
    let Page = +req.params.page;
    jobModel.find({}, function (err, jobs) {
            return jobs;
        }).skip((Page-1)*10).limit(10)
        .then(function (jobs) {
            res.render('result', {
                Jobs: jobs,
                page: Page
            });
        });
});

router.get('/search', function (req, res) {
    console.log(req.query);
    let Page;
    if (req.query.page == null)
        Page = 1;
    jobModel.find({ title: req.query.q }, function (err, jobs) {
        console.log(jobs);
        return jobs;
    }).skip((Page-1)*10).limit(10)
    .then(function (jobs) {
        res.render('result', {
            Jobs: jobs,
            page: Page
        });
    });
})

// router.get('*', function (req, res) {
//     res.send(404);
// });


app.listen(3030);
console.log('Server in runnig on port 3030');
