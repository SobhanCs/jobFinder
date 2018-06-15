//Crawler to scrap the websites sources

//requires
const mongo = require("mongoose");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");

//global variables
var $,repeated=0;
var allData = [];


//#crawler start
console.log("server started");



function generateUrl(prefixUrl, pageNumberUrl, suffixUrl, urlTarget) {
    let urlsArray = [];
    axios.get(prefixUrl + +pageNumberUrl + suffixUrl)
        .then(function (response) {
            $ = cheerio.load(response.data);
            for (var item in $(urlTarget)) {
                if (Number.isInteger(+item)) {
                    urlsArray.push($(urlTarget).eq(item).attr("href"));
                }
            }
            // console.log(urlsArray);
            // return urlsArray;
            urlsArray.forEach(item => {
                getUrlDetails(item, "li.c-infoBox__item", ".c-infoBox__itemTitle", ".black")
            });


        });

}

function startCrawler(storeData) {
    var page = 1;

    while(page<172){//repeated<10

        generateUrl("https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B0%5D=&sort_by=published_at_desc&page=", page, "", "h3.c-jobListView__title > a.c-jobListView__titleLink")

        page ++;

        if(false){//when a job already exist
            repeated ++;
        }
    }
}

startCrawler(storeData);


function getUrlDetails(url, li, title, tag, callBack) { //any li have a title and some tags --> title like : مهارت های مورد نیاز  and tags like : ux/sketch/css
    axios.get(url)
        .then(function (response) {
            //  console.log(response);
            $ = cheerio.load(response.data)

            let subject = "";

            let dataOfThisJob = [];

            $(li).each(function (i) {
                subject = $(this).find(title).text();
                // console.log(subject);
                let items = [];

                $(this).find(tag).each(function () {
                    // console.log($(this).text());
                    items.push($(this).text())
                });

                dataOfThisJob.push({
                    subject: subject,
                    items: items
                })

                allData.push({
                    url: url,
                    data: dataOfThisJob
                })

            }).done(function(){


                storeData(allData)//BAD PLACE :(
            })





        })

}

function storeData(data) { //i don't know when call this function that allData synced
    //connect to mongo and update
    // console.log(data);
    // fs.writeFileSync("first-card-data",data)

    data.forEach(function (element) {
        var str = "";

        // console.log('{URL : "' + element.url + '",\nDATA: { ');
        str += '{URL : "' + element.url + '",\nDATA: { \n';
        element["data"].forEach(function(dataElement) {
            // console.log('\tTitle : "' + dataElement.subject +' " ,\n\tItems :');
            str += '\tTitle : "' + dataElement.subject +' " ,\n\tItems :\n';
            dataElement["items"].forEach(function(items) {
                // console.log("\t" + items + "\n}\n}");
                str += "\t" + items + "\n"

            })
            //
        })
        str += "------------------------------------------"
        // console.log("----------------------------------------");
        //fs.appendFileSync("first-card-data",str);

        // "url : " + element.url + "\n"
        //console.log(element.data.forEach({}));

    })
}
