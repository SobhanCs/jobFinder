// server.js
// load the things we need
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var jobModel = require('./app/models/jobModel');

// set the view engine to ejs
app.set('view engine', 'ejs');
// app.set('views', 'views');
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

mongoose.connect("mongodb://localhost:27017/jobteam", function (err) {
    if (err) throw err;
    console.log("mongodb connected!");
});

app.use('/', router);
// use res.render to load up an ejs view file

// homepage page 
router.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

// all page 
router.get('/all', function (req, res) {
    jobModel.find({}, function (err, jobs) {
            return jobs;
        }).limit(10)
        .then(function (jobs) {
            res.render('result', {
                Jobs: jobs
            });
        });
});

// router.get('*', function (req, res) {
//     res.send(404);
// });

app.listen(8080);
console.log('Server in runnig on port 8080');