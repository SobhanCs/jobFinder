//Crawler to scrap the job websites sources

//requires
const mongoose = require("mongoose");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");

//global variables
let $, repeated = 0,
    i = 0;

var sources = {
    "jobinja": {
        "url": {
            "prefix": "https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B0%5D=&sort_by=published_at_desc&page=",
            "suffix": "",
            "page": 1
        },
        "target": {
            "subject": ".c-jobView__titleText",
            "linksOfJob": "h3.c-jobListView__title > a.c-jobListView__titleLink",
            "conditions": "li.c-infoBox__item",
            "titleOfConditions": ".c-infoBox__itemTitle",
            "tagInTitleOfConditions": ".black",
            "expireDate": ".u-textCenter.u-textSmall.u-mB0 b",
            "logoOfCompany": ".c-companyHeader__logoImage",
            "description": ".o-box__text",
            "companyName": ".c-companyHeader__name"
        },
        "lastCrawlDate": true,
        lastJobThatSortedByDate: ""
    }
}

// crawler start
console.log("Crawler started...");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/jobteam");
let db = mongoose.connection;

// mongodb status
db.on('error', function () {
    console.log("We are not connected to MongoDB !");
});
db.once('connected', function () {
    console.log("We are connected to MongoDB !");
});

// defining jonSchema in mongodb
let jobSchema = new mongoose.Schema({
    url: {
        type: String,
        require: true
    }, // target url
    id: {
        type: String,
        require: true
    }, // use the link of job as id
    title: {

        type: String
        // require: true

    },
    typeOfJob: String,
    location: String,
    typeOfCollaboration: String,
    Salary: String,
    militeryService: String,
    skill: {
        type: Array,
        require: true
    },
    sex: String,
    relativeField: [],
    education: [],
    logo: String,
    companyName: {
        type: String,
        require: true
    },
    description: String,

    expireTime: String,
    crawlTime: String,
    experience: String,
    logoSource: String,
    companyName: String
});

let jobModel = mongoose.model("jobModel", jobSchema, 'jobModel'); // the name of collection by erfan


// generateUrl() crawl a page and output an array of links of the page. 
function generateUrl(prefixUrl, pageNumberUrl, suffixUrl, urlTarget) {
    let urlsArray = [];
    axios.get(prefixUrl + pageNumberUrl + suffixUrl) // put a request to a url and get its html source
        .then(function (response) {
            $ = cheerio.load(response.data); // render received html source to can working it as a jquery syntax
            for (let item in $(urlTarget)) { // loop on all our target items
                if (Number.isInteger(+item)) { // filter only urls in page - urls' name are explicitly a number
                    urlsArray.push($(urlTarget).eq(item).attr("href")); // read href attribute of tag 'a' and push it into output array
                }
            }

        }).then(function () {
            urlsArray.forEach(item => {
                getUrlDetails(item, sources.jobinja.target)
            })
        });
    // .catch(function (error) {
    //     console.log(error);
    //   });
}


function startCrawler(website) {

    while (website.url.page < 21) { //repeated<10
        generateUrl(website.url.prefix, website.url.page, website.url.suffix, website.target.linksOfJob)
        website.url.page++;
        // if (false) { //when a job already exist
        // repeated++;
        // }
    }
}

startCrawler(sources.jobinja);

//this function get a link that is a new job ,this job need to reed data and target help us for select any items in detail
function getUrlDetails(url, target) {
    axios.get(url) //axios make request and get data of detail page
        .then(function (response) {
            $ = cheerio.load(response.data) //cherio get data from axios and help us to select objects in html source like jquery

            let subject = ""; //subject like : ...جنسیت و حداقل مدرک و حقوق و 

            let dataOfThisLi = []; //a array that have ["جنسیت","مرد"]


            let final = { //finall is an object that will append to data base
                url: url,
                id: "our detail url",
                crawlTime: "امروز",
                expireTime: $(target.expire).text().replace(/ روز/g, ''),
                description: $(target.description).text(),
                logoSource: $(target.logoOfCompany).attr("src"),
                companyName: $(target.companyName).text(),
            }

            $(target.conditions).each(function () {
                //fill subjects in foreach and get tags of this subject in next forEach
                subject = $(this).find(target.titleOfConditions).text(); //like "مهارت ها"

                let items = [], //an array that have tags in a subject like ["ui/ux","html","css","js"]
                    data = {}; //this object join subject and their tags to url


                $(this).find(target.tagInTitleOfConditions).each(function () {
                    items.push($(this).text())
                });

                dataOfThisLi.push({ //join tags to subject
                    subject: subject,
                    items: items
                })

            })
            data = {
                url: url,
                preRequire: dataOfThisLi
            }

            //we make relation array to convert lang :D get titles from site and make field in database
            relation = [
                ["عنوان", "title"],
                ["دسته بندی شغلی", "typeOfJob"],
                ["موقعیت مکانی", "location"],
                ["نوع همکاری", "typeOfCollabration"],
                ["حقوق", "Salary"],
                ["وضعیت نظام وظیفه", "militeryService"],
                ["مهارت های مورد نیاز", "skill"],
                ["جنسیت", "sex"],
                ["رشته‌های تحصیلی مرتبط", "relativeField"],
                ["حداقل مدرک تحصیلی", "education"],
            ];

            data["preRequire"].forEach(function (dataElement) {
                thisItems = [];
                dataElement["items"].forEach(function (items) { // Use forEach for tags
                    thisItems.push(items.trim().replace(/  /g, '')) //get items in title and remove whitespace
                })

                relation.forEach(item => {
                    if (item[0] == dataElement.subject) {
                        final[item[1]] = thisItems; //add other field and data to finall 
                    }
                    
                })

            })

            console.log(final);  // log the url details

            // i++;
            //log finall and add to database - final is an object of a job
            jobModel.insertMany(final,
                function () {
                    // console.log(i);
                });
        })

}