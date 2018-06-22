// server.js
// load the things we need
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// result page 
app.get('/', function(req, res) {
    res.render('pages/result');
});

// about page 
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8080);
console.log('Server in runnig on port 8080');

