//Crawler to scrap the job websites sources

//requires
const mongoose = require("mongoose");
const cheerio = require('cheerio');
const fs = require("fs");
const axios = require("axios");

//global variables
let $, repeated = 0;

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
    console.log("We are connected to MongoDB !")
});

// defining jonSchema in mongodb
let jobSchema =  new mongoose.Schema({
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
    description: String,
    logoSource : String,
    companyName : String
});

let jobModel = mongoose.model("jobModel", jobSchema, 'jobModel'); // the name of collection by erfan

function generateUrl(prefixUrl, pageNumberUrl, suffixUrl, urlTarget) {
    let urlsArray = [];
    axios.get(prefixUrl + +pageNumberUrl + suffixUrl)
        .then(function (response) {
            $ = cheerio.load(response.data);
            for (let item in $(urlTarget)) {
                if (Number.isInteger(+item)) {
                    urlsArray.push($(urlTarget).eq(item).attr("href"));
                }
            }
            // console.log(urlsArray);
            // return urlsArray;
            urlsArray.forEach(item => {
                getUrlDetails(item,".o-box__text ","li.c-infoBox__item", ".c-infoBox__itemTitle", ".black",".c-companyHeader__logoImage",".c-companyHeader__name",".u-textCenter.u-textSmall.u-mB0 b")
            });
        });
}

function startCrawler() {
    let page = 1;

     while (page < 10) { //repeated<10

        generateUrl("https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B0%5D=&sort_by=published_at_desc&page=", page, "", "h3.c-jobListView__title > a.c-jobListView__titleLink")

        page++;

        if (false) { //when a job already exist
            repeated++;
        }
     }
}

startCrawler();


function getUrlDetails(url,description,li, title, tag,logo,name,expire) { //any li have a title and some tags --> title like : مهارت های مورد نیاز  and tags like : ux/sketch/css
    axios.get(url)
        .then(function (response) {
            //  console.log(response);
            $ = cheerio.load(response.data)

            let subject = "";

            let dataOfThisLi = [];

            let finall = {url : url,
                          id : "our detail url",
                          crawlTime: "امروز",
                          expireTime: $(expire).text().replace(/ روز/g,''),
                          description: $(description).text(),
                          logoSource : $(logo).attr("src"),
                          companyName : $(name).text()
            }
            $(li).each(function () {
                subject = $(this).find(title).text();
                // console.log(subject);
                let items = [], data = {};

                $(this).find(tag).each(function () {
                    // console.log($(this).text());
                    items.push($(this).text())
                });

                dataOfThisLi.push({
                    subject: subject,
                    items: items
                })
            })     
                data = {
                    url: url,
                    preRequire: dataOfThisLi
                }
                //console.log(data);

                relation = [
                            ["عنوان","title"],
                            ["دسته بندی شغلی","typeOfJob"],
                            ["موقعیت مکانی","location"],
                            ["نوع همکاری","typeOfCollabration"],
                            ["حقوق","Salary"],
                            ["وضعیت نظام وظیفه","militeryService"],
                            ["مهارت های مورد نیاز","skill"],
                            ["جنسیت","sex"],
                            ["رشته‌های تحصیلی مرتبط","relativeField"],
                            ["حداقل مدرک تحصیلی","education"],
                            ];
                            
                      data["preRequire"].forEach(function (dataElement) {
                   
                    thisItems = [];
                    dataElement["items"].forEach(function (items) { // Use forEach for tags
                       
                        thisItems.push(items.trim().replace(/  /g,''))
                    })

                    relation.forEach(item => {
                        if(item[0] == dataElement.subject){
                            finall[item[1]] = thisItems;                   
                        }                   
                    })
                    
                    
                })
                console.log(finall);
                jobModel.insertMany(finall,
                   function (err, response) {
                       if(err){throw err}
                       console.log("Successfuly saved !")
                });
    }) 
}