//requires 
const express = require("express");
const mongo = require("mongoose");
const bodyParser = require("body-parser");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");
var $;


var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));


var str = "";

console.log("server started");


function crawler(url, params, structObj) {
    axios.get(url, params)
        .then(function (response) {
            // console.log(response);
            $ = cheerio.load(response.data)
            
            console.log($);

            // fs.writeFileSync("first-card-data1.txt", $('html').text());
            // fs.writeFileSync("first-card-data.txt", String($().text()));


        })
}




crawler("https://jobinja.ir/jobs", {
    page: 2
});