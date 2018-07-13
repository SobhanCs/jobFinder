// server.js


// set up ======================================================================
// get all the tools we need

var express = require('express');
var mongoose = require('mongoose');
//var port         = process.env.PORT || 8580;
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var rfs = require('rotating-file-stream')

var app = express();
var router = express.Router();
var jobModel = require('./app/models/jobModel');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/jobteam");
let db = mongoose.connection;

// mongodb status
db.on('error', function () {
    console.log("We are not connected to MongoDB !");
});
db.once('connected', function () {
    // console.log("We are connected to MongoDB !");
});


require('./config/passport')(passport); // pass passport for configuration


// set up our express application - logger
var logDirectory = path.join(__dirname, 'logger') //logDirectory

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = rfs('logger.csv', {
  interval: '1d', // rotate daily
  path: logDirectory
})

// setup the logger
app.use(morgan(':remote-addr, :remote-user, [:date[web]], :method, :url, HTTP/:http-version, :response-time[digits], :status, :res[content-length], :req[header], :res[header], ":referrer", ":user-agent"', {stream: accessLogStream}))

// app.use(morgan('dev')); // log every request to the console

// create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logger.csv'), {flags: 'a'})



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
app.use(session({
    secret: 'maktab13jobteam',
    resave: false,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



app.use(express.static(__dirname + '/public'));


mongoose.connect("mongodb://localhost:27017/jobteam", function (err) {
    if (err) throw err;
    console.log("We are connected to MongoDB!");
});

app.use('/', router);
// use res.render to load up an ejs view file

// homepage page 
router.get('/', function (req, res) {

    res.render('index');
});

router.get('/login', function (req, res) {

    console.log(__dirname);
    res.render('/views/login.ejs');
});

router.get('/signup', function (req, res) {

    console.log(__dirname);
    res.render('/views/signup.ejs');
});

router.get('/', function (req, res) {
    // console.log("hi");
    res.render(__dirname + "/views/dashboard.ejs");
});

// router.get('/panel', function (req, res) {
//     res.render(__dirname + "/views/panel.ejs");
// });

// router.get('/result', function (req, res) {
//     res.render(__dirname + "/views/result.ejs");
// });

// all page 
router.get('/all/:page', function (req, res) {
    let Page = +req.params.page;
    jobModel.find({}, function (err, jobs) {
            return jobs;
        }).skip((Page - 1) * 10).limit(10)
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

//dashboard
var currentPage = 1;
app.get('/panel', function (req, res) {

        jobModel.find({
            "visibility": "NEW"
        }).count(function (err, result) {
            if (err)
                console.log(">>>>>>>>>>>>>>>>>>>>>>> Database Error: cant find url of undefined " + err);
    
            res.render(__dirname + '/views/panel', {
                news: result
            })
        })
    });
    
    app.get('/newjobs/:page', function (req, res) {
        let page = req.params.page
        let pageSize = 15
    
        currentPage = page
    
        jobModel.find({
            "visibility": "NEW"
        }, function (err, json) {
            if (err)
                console.log(">>>>>>>>>>>>>>>>>>>>>>>Database Error: cant find url of undefined " + err);
    
            res.json(json)
            page++
        }).skip(pageSize * (page - 1)).limit(pageSize)
    });
    
    app.post('/addNew', function (req, res) {
        console.log("new job visible");
        let newJob = JSON.parse(JSON.stringify(req.body));
    
        jobModel.update({
            "url": newJob.url
        }, {
            $set: {
                "visibility": "visible"
            }
        }, function (err, item) {
            if (err)
    
                console.log(item);
    
        })
    
        res.redirect('/newjobs/' + currentPage);
    });
    
    app.post('/newArchive', function (req, res) {
        console.log("new job hidden");
        let newArchive = JSON.parse(JSON.stringify(req.body));
    
        jobModel.update({
            "url": newArchive.url
        }, {
            $set: {
                "visibility": "hidden"
            }
        }, function (err, item) {
            if (err)
    
                console.log(item);
    
        })
    
        res.redirect('/newjobs/' + currentPage);
    });


app.listen(3030);
console.log('\nServer is runnig on port 3030');