//Crawler to scrap the websites sources

//requires 
const mongo = require("mongoose");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");

//global variables
var $;
var allData = [];

//#crawler start
console.log("server started");


function generateUrl(prefixUrl, pageNumberUrl, suffixUrl, urlTarget) {
    let urlsArray = [];
    axios.get(prefixUrl + +pageNumberUrl + suffixUrl)
        .then(function (response){
            $ = cheerio.load(response.data);
            for(var item in $(urlTarget)) {
                if ( Number.isInteger(+item) ){
                    urlsArray.push( $(urlTarget).eq(item).attr("href") );
                }                        
            }
            console.log(urlsArray);
            return urlsArray;
        });
}

// generateUrl("https://jobinja.ir/jobs", {page: 2} , "h3.c-jobListView__title > a.c-jobListView__titleLink" , "li.c-infoBox__item div");
generateUrl("https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B0%5D=&sort_by=published_at_desc&page=" ,3 ,"" ,"h3.c-jobListView__title > a.c-jobListView__titleLink");

function getLinksOfJobs(urlTarget, conditionTarget){

    for(var i in $(urlTarget)) {
        
            if ($(urlTarget).eq(i).attr("href") != undefined){
                let UrlOfThisJobForShowMore = $(urlTarget).eq(i).attr("href");
                // getdetailsOfLink(UrlOfThisJobForShowMore,conditionTarget)
            }
        
    }
}

function getdetailsOfLink(url,target){
    axios.get(url)
        .then(function (response) {
            //  console.log(response);
            $ = cheerio.load(response.data)

            let subject = "";
            let items = [];

            let dataOfThisJob = [];

            $(target).each(function(index){

                subject = $(this).prev().text();

                $(this).find("span").each(function(){
                    items.push($(this).text());
                })   
                
                dataOfThisJob.push({url:url ,
                                    info:{subject:subject,
                                        items:items}}
                                    )

                

                allData.push(dataOfThisJob)
                
            })
        })
}

function storeData(data){
    //connect to mongo and update
    console.log(allData)
}