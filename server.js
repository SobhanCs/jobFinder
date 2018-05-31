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
            
            getLinksOfJobs(structObj)

            // fs.writeFileSync("first-card-data1.txt", $('html').text());
            // fs.writeFileSync("first-card-data.txt", String($().text()));


        })
}


crawler("https://jobinja.ir/jobs", {page: 2} , "h3.c-jobListView__title > a.c-jobListView__titleLink");

function getdetailsOfLink(){
    
}

function getLinksOfJobs(structure){
  
    for(var i in $(structure)) {
        // if (Number(i) == NaN) {
        //     console.log($(structure).eq(i).attr("href"))
        // }
        console.log(Number(i))
    }

    getdetailsOfLink()
}

