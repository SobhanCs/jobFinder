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


function crawler(url, params, urlOfJobTarget , liOfConditionsInJobTarget,targetOfTitleCondition,targetOfTagInTheTitle) {
    axios.get(url, params)
        .then(function (response){
            //  console.log(response);
            $ = cheerio.load(response.data)
            
            getLinksOfJobs(urlOfJobTarget,liOfConditionsInJobTarget,targetOfTitleCondition,targetOfTagInTheTitle)
        })

}

crawler("https://jobinja.ir/jobs", {page: 2} , "h3.c-jobListView__title > a.c-jobListView__titleLink" , "li.c-infoBox__item", ".c-infoBox__itemTitle",".black");


function getLinksOfJobs(urlTarget,liOfConditionTarget,targetOfTitleCondition,targetOfTagInTheTitle){

    for(var i in $(urlTarget)) {
        
            if ($(urlTarget).eq(i).attr("href") != undefined){
                let UrlOfThisJobForShowMore = $(urlTarget).eq(i).attr("href");
                getUrlDetails(UrlOfThisJobForShowMore,liOfConditionTarget,targetOfTitleCondition,targetOfTagInTheTitle)
            }
        
    }
}

function getUrlDetails(url,li,title,tag){//any li have a title and some tags --> title like : مهارت های مورد نیاز  and tags like : ux/sketch/css
    axios.get(url)
        .then(function (response) {
            //  console.log(response);
            $ = cheerio.load(response.data)

            let subject = "";

            let dataOfThisJob = [];

            $(li).each(function(i){
                subject = $(this).find(title).text();
                // console.log(subject);
                let items = [];

                $(this).find(tag).each(function(){
                    // console.log($(this).text());
                    items.push($(this).text())
                });

                dataOfThisJob.push({
                    subject : subject,
                    items: items
                })

            }) 

            allData.push({url : url , data : dataOfThisJob})
            storeData(allData);
            

        })

}

function storeData(data){//i don't know when call this function that allData synced
    //connect to mongo and update
    console.log(data);

}