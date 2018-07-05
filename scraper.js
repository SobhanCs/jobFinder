//Crawler to scrap the job websites sources

//requires
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/scraper/public"));
app.listen(8080);

const bodyParser = require('body-parser')
app.use(bodyParser.json());

const mongoose = require("mongoose");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");

//global variables
let $, repeated = 0,
    json = {};

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
            "companyName": ".c-companyHeader__name",
            "jobPerPage": 15
        },
        "lastCrawlDate": true,
        lastJobThatSortedByDate: ""
    },
    "jobvision": {
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
            "companyName": ".c-companyHeader__name",
            "jobPerPage": 2
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
    companyName: String,
    visibility: String
});

let jobModel = mongoose.model("jobModel", jobSchema, 'jobModel'); // the name of collection by erfan


// generateUrl() crawl a page and output an array of links of the page. 
function generateUrl(url, target) {

    let urlsArray = [];

    axios.get(url.prefix + url.page + url.suffix) // put a request to a url and get its html source
        .then(function (response) {
            $ = cheerio.load(response.data); // render received html source to can working it as a jquery syntax

            for (let item in $(target.linksOfJob)) { // loop on all our target items
                if (Number.isInteger(+item)) { // filter only urls in page - urls' name are explicitly a number
                    urlsArray.push($(target.linksOfJob).eq(item).attr("href")); // read href attribute of tag 'a' and push it into output array
                }
            }
            target.jobPerPage = urlsArray.length
            console.log("pageNumber :  " + url.page);

            console.log("number of jobs in this page is : " + target.jobPerPage);

            getUrlDetails(url, urlsArray, sources.jobinja.target)

        })
}

generateUrl(sources.jobinja.url, sources.jobinja.target)

var index = 0;
//this function get a link that is a new job ,this job need to reed data and target help us for select any items in detail
function getUrlDetails(object, urls, target) {

    let url = urls[index];

    axios.get(url) //axios make request and get data of detail page
        .then(function (response) {
            $ = cheerio.load(response.data) //cherio get data from axios and help us to select objects in html source like jquery

            let subject = ""; //subject like : ...جنسیت و حداقل مدرک و حقوق و 

            let dataOfThisLi = []; //a array that have ["جنسیت","مرد"]

            let final = { //finall is an object that will append to data base
                url: url,
                id: "our detail url",
                visibility:"visible",
                crawlTime: repeated,
                expireTime: $(target.expire).text().replace(/ روز/g, ''),
                descriptionOfJob: $(target.description).eq(0).text().trim().replace(/  /g, ''),
                descriptionOfCompany: $(target.description).eq(1).text().trim().replace(/  /g, ''),
                logoSource: $(target.logoOfCompany).attr("src"),
                companyName: $(target.companyName).text().trim().replace(/  /g, ''),
                title: $(target.subject).text().trim().replace(/استخدام/g, "").trim().replace(/  /g, '')
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
                ["دسته‌بندی شغلی", "typeOfJob"],
                ["موقعیت مکانی", "location"],
                ["نوع همکاری", "typeOfCollabration"],
                ["حقوق", "Salary"],
                ["وضعیت نظام وظیفه", "militeryService"],
                ["مهارت‌های مورد نیاز", "skill"],
                ["جنسیت", "sex"],
                ["رشته‌های تحصیلی مرتبط", "relativeField"],
                ["حداقل مدرک تحصیلی", "education"],
                ["حداقل سابقه کار", "minExperience"]
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
            // console.log(final);

            //log finall and add to database - final is an object of a job
            jobModel.insertMany(final,
                function () {
                });

            index++;
            json[index] = final;
            console.log("job state " + index + " done !");
            if (index < target.jobPerPage) {
                getUrlDetails(object, urls, sources.jobinja.target)
            } else {
                index = 0;
                console.log("----------------------------------");

                if (object.page < 1) {
                    object.page++;
                    generateUrl(sources.jobinja.url, sources.jobinja.target)
                } else {
                    console.log("scaper done!!");

                }
            }
        })

}
app.get('/', function (req, res) {
    console.log("");
    res.render(__dirname + '/scraper/views/panel', {})
});

app.get('/news', function (req, res) {
    console.log("ajaxCalled");

    res.json(json)
});

app.post('/addNew', function (req, res) {
    console.log("new job !!");
    let newJob = JSON.stringify(req.body);
    console.log(newJob);
    res.redirect('/news');

});

app.post('/newArchive', function (req, res) {
    console.log("new archive !!");
    let newArchive = JSON.stringify(req.body);
    newArchive.visibility = "hidden"
    console.log(newArchive);
    res.redirect('/news');
});