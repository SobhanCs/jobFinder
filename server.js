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


function crawler(url, params, urlOfJobTarget , conditionsOfJobTarget) {
    axios.get(url, params)
        .then(function (response){
            //  console.log(response);
            $ = cheerio.load(response.data)
            
            getLinksOfJobs(urlOfJobTarget,conditionsOfJobTarget)
        })

        //update new jobs
    storeData(allData)

}

crawler("https://jobinja.ir/jobs", {page: 2} , "h3.c-jobListView__title > a.c-jobListView__titleLink" , "li.c-infoBox__item div");


function getLinksOfJobs(urlTarget,conditionTarget){

    for(var i in $(urlTarget)) {
        
            if ($(urlTarget).eq(i).attr("href") != undefined){
                let UrlOfThisJobForShowMore = $(urlTarget).eq(i).attr("href");
                getdetailsOfLink(UrlOfThisJobForShowMore,conditionTarget)
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