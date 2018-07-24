//Crawler to scrap the job websites sources

//requires
const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.listen(8080);

const bodyParser = require('body-parser')
app.use(bodyParser.json());

const mongoose = require("mongoose");
const cheerio = require('cheerio');
const axios = require("axios");

//global variables
let $, repeated = 0,
  json = {},
  news = 0;
turn = 0

var sites = ["jobinja", "jobvision", "karboom"]

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
      "logoOfCompany": "img.c-companyHeader__logoImage",
      "description": ".o-box__text",
      "companyName": ".c-companyHeader__name",
      "jobPerPage": 15,
      "siteName": "jobinja"
    },
    "lastCrawlDate": true,
    "lastJobThatSortedByDate": ""

  },
  "jobvision": {
    "url": {
      "url": "https://jobvision.ir/JobPost/GetJobPostListData",
      "prefix": "https://jobvision.ir",
      "page": 1
    },
    "target": {
      "subject": ".value-text-size.jobtitle",
      "linksOfJob": ".jobpost-box:not(.headBox)",
      "jobBox": "div.jobpostmainbox",
      "conditions": "#third",
      "titles": ".title-text-size:not(.blue)",
      "values": ".value-text-size",
      "logoOfCompany": "img.center-block",
      "companyName": ".title-text-size.jobtitle",
      "skill":"#third div:nth-child(6) .softwares-info-block.ref-software span:first-child",
      "sex":"#third > div:nth-child(2) .value-text-size",
      "minExperience":"#third > div:nth-child(3) .value-text-size",
      "education":"#third > div:nth-child(4)  .value-text-size",
      "jobPerPage": 40,
      "siteName": "jobvision"
    },
    "lastCrawlDate": true,
    "lastJobThatSortedByDate": ""
  },
  "karboom": {
    "url": {
      "prefix": "https://karboom.io/jobs?page=",
      "suffix": "",
      "page": 1
    },
    "target": {
      "subject": "div.intro-company > div:last-child > div.information > div:nth-child(2) h4",
      "linksOfJob": "div#search-result  > .result-filter > div:first-child > a",
      "logoOfCompany": "div.intro-company > div:first-child > img",
      "companyName": "div.intro-company > div:last-child > div:first-child > h1",
      "span": "div.intro-company > div:last-child > div:first-child > h1 span",
      "semiDesc": "div.intro-company > div:last-child > div.information h4",
      "education": ".requirements > div > div.row > div.grade span.label",
      "sex": ".requirements > div > div > div.col-md-4:last-child span",
      "skill": ".progress",
      "location": ".information h5",
      "relativeField": ".field a",
      "descOfCompany": ".box-light-gray.clearfix p",
      "descOfJob": ".duties p",
      "jobPerPage": 13,
      "siteName": "karboom"
    },
    "lastCrawlDate": true,
    "lastJobThatSortedByDate": ""

  },
  "sokanacademy": {
  }
}

// crawler start
console.log("Crawler ready...\n");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/jobteam");
let db = mongoose.connection;

// mongodb status
db.on('error', function() {
  console.log("We are not connected to MongoDB !");
});
db.once('connected', function() {
  console.log("We are connected to MongoDB !\n");
});

const jobModel = require('./app/models/jobModel'); // the name of collection by erfan
const counter = require('./app/models/counterModel'); // for auto-increment id field

counter.findById({
  _id: 'entityId'
 }, function(err, res) {
  if (err) throw err;
  if (res == null) {
    new counter({
      _id: 'entityId',
      seq: 1
    }).save();
  }
})

// generateUrl() crawl a page and output an array of links of the page.
function generateUrl(source, url, target) {

  let urlsArray = [];
  if (target.siteName == "jobvision") {
    axios.post(url.url, {
        page: url.page,
        SortBy: 0,
        JobTitle: '',
        SelectedCity: '',
        SelectedIndustrial: '',
        SelectedLevelOfSeniority: '',
        SelectedJobGroup: '',
        SelectedWorkType: '',
        SelectedWorkExprience: '',
        MinMatchingPercent: 0,
        MaxMatchingPercent: 0,
        pageSize: 40,
        IsForJobFair: false,
        validateStatus: function(status) {
          return status < 500; // Reject only if the status code is greater than or equal to 500
        }
      }) // put a request to a url and get its html source
      .then(function(response) {
        $ = cheerio.load(response.data); // render received html source to can working it as a jquery syntax
        let statusCode = response.status

        console.log("pageNumber :  " + url.page + " /  get with status code :" + statusCode);

        for (let item in $(target.linksOfJob)) { // loop on all our target items
          if (Number.isInteger(+item)) { // filter only urls in page - urls' name are explicitly a number
            urlsArray.push(url.prefix + $(target.linksOfJob).eq(item).attr("data-href")); // read href attribute of tag 'a' and push it into output array
          }
        }

        target.jobPerPage = urlsArray.length

        console.log("number of jobs in this page is : " + target.jobPerPage +'\n');

        getUrlDetails(source, urlsArray, target)

      })

  }
  else {
    axios.get(url.prefix + url.page + url.suffix, {
        validateStatus: function(status) {
          return status < 500; // Reject only if the status code is greater than or equal to 500
        }
      }) // put a request to a url and get its html source
      .then(function(response) {
        $ = cheerio.load(response.data); // render received html source to can working it as a jquery syntax
        let statusCode = response.status

        console.log("pageNumber :  " + url.page + " /  get with status code :" + statusCode);

        for (let item in $(target.linksOfJob)) { // loop on all our target items
          if (Number.isInteger(+item)) { // filter only urls in page - urls' name are explicitly a number
            urlsArray.push($(target.linksOfJob).eq(item).attr("href")); // read href attribute of tag 'a' and push it into output array
          }
        }

        target.jobPerPage = urlsArray.length

        console.log("number of jobs in this page is : " + target.jobPerPage + '\n');

        getUrlDetails(source, urlsArray, target)

      })
  }
}

//main call
// generateUrl(sources.jobinja, sources.jobinja.url, sources.jobinja.target)
function start(json, site) {
  if (site) {
    index = 0;
    repeated = 0;
    console.log("****** start scrap in " + site+' ***********\n');
    generateUrl(json[site], json[site].url, json[site].target)
  } else {
    console.log("----------------------\n--------The End-------\n----------------------")
  }
}

start(sources, sites[turn])


var index = 0; //start crawl job with index
//this function get a link that is a new job ,this job need to reed data and target help us for select any items in detail
function getUrlDetails(object, urls, target) {

  let url = urls[index];

  axios.get(url, {
      validateStatus: function(status) {
        return status < 500; // Reject only if the status code is greater than or equal to 500
      }
    }) //axios make request and get data of detail page
    .then(function(response) {
      $ = cheerio.load(response.data) //cherio get data from axios and help us to select objects in html source like jquery
      let statusCode = response.status
      let final = {}

      if (target.siteName == 'jobinja') {
        let subject = ""; //subject like : ...جنسیت و حداقل مدرک و حقوق و

        let dataOfThisLi = []; //a array that have ["جنسیت","مرد"]

        final = { //finall is an object that will append to data base
          url: url,
          id: 0,
          visibility: "NEW",
          crawlTime: new Date().toJSON(),
          expireTime: $(target.expireDate).text().replace(/ روز/g, ''),
          descriptionOfJob: $(target.description).eq(0).text().trim().replace(/  /g, ''),
          descriptionOfCompany: $(target.description).eq(1).text().trim().replace(/  /g, ''),
          logoSource: $(target.logoOfCompany).attr("src"),
          companyName: $(target.companyName).text().trim().replace(/  /g, ''),
          title: $(target.subject).text().trim().replace(/استخدام/, "").trim().replace(/  /g, ' ').split('\n')[0],
          siteName: target.siteName
        }

        $(target.conditions).each(function() {
          //fill subjects in foreach and get tags of this subject in next forEach
          subject = $(this).find(target.titleOfConditions).text(); //like "مهارت ها"

          let items = [], //an array that have tags in a subject like ["ui/ux","html","css","js"]
            data = {}; //this object join subject and their tags to url


          $(this).find(target.tagInTitleOfConditions).each(function() {
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
        let relation = [
          ["دسته‌بندی شغلی", "typeOfJob"],
          ["موقعیت مکانی", "location"],
          ["نوع همکاری", "typeOfCollaboration"],
          ["حقوق", "Salary"],
          ["وضعیت نظام وظیفه", "militeryService"],
          ["مهارت‌های مورد نیاز", "skill"],
          ["جنسیت", "sex"],
          ["رشته‌های تحصیلی مرتبط", "relativeField"],
          ["حداقل مدرک تحصیلی", "education"],
          ["حداقل سابقه کار", "minExperience"]
        ];

        data["preRequire"].forEach(function(dataElement) {
          thisItems = [];
          dataElement["items"].forEach(function(items) { // Use forEach for tags
            thisItems.push(items.trim().replace(/  /g, '')) //get items in title and remove whitespace
          })

          relation.forEach(item => {
            if (item[0] == dataElement.subject) {
              final[item[1]] = thisItems; //add other field and data to finall
            }
          })

        })
      }
      else if (target.siteName == "karboom") {
        final = { //finall is an object that will append to data base
          url: url,
          id: 0,
          visibility: "NEW",
          crawlTime: new Date().toJSON(),
          logoSource: $(target.logoOfCompany).attr("src"),
          companyName: $(target.companyName).text().trim().replace(/در شرکت/, "").trim().replace(/  /g, '').split('\n')[0],
          title: $(target.subject).text().trim().replace(/استخدام^/, "").trim().replace(/  /g, ' ').split('\n')[0],
          Salary: $(target.semiDesc).eq(3).text().trim().replace(/  /g, ' '),
          typeOfCollaboration: $(target.semiDesc).eq(2).text().trim(),
          typeOfJob: $(target.semiDesc).eq(1).text().trim().replace(/  /g, ' '),
          education: $(target.education).text().trim().replace(/  /g, ' '),
          sex: $(target.sex).text().trim().replace(/  /g, ' '),
          location: $(target.location).text().split('|')[0].trim(),
          descriptionOfCompany: $(target.descOfCompany).text().trim(),
          skill: [],
          relativeField: [],
          descriptionOfJob: [],
          siteName: target.siteName,
        }
        $(target.skill).each(function() {
          if (typeof $(this).prev().text() === "string") {
            final['skill'].push($(this).prev().text())
          }
        })
        $(target.relativeField).each(function() {
          if (typeof $(this).text() === "string") {
            final['relativeField'].push($(this).text())
          }
        })
        $(target.descOfJob).each(function() {
          if (typeof $(this).text() === "string") {
            final['descriptionOfJob'].push($(this).text())
          }
        })


      }
      else if (target.siteName == "jobvision") {
        final = {
          url: url,
          id: 0,
          visibility: "NEW",
          crawlTime: new Date().toJSON(),
          logoSource: $(target.logoOfCompany).attr("src"),
          companyName: $(target.companyName).text().trim().replace(/  /g, ''),
          title: $(target.subject).text().trim().replace(/  /g, ' ').split('\n')[0],
          siteName: target.siteName,
          typeOfJob:'',
          typeOfCollaboration:'',
          location:'',
          descriptionOfJob:'',
          skill : [],
          sex:$(target.sex).eq(1).text().trim(),
          militeryService:$(target.sex).eq(2).text().trim(),
          minExperience:$(target.minExperience).text().trim(),
          education:$(target.education).eq(0).text().trim()
        }

        $(target.skill).each(function(){
          if (typeof $(this).text() === "string") {
            final['skill'].push($(this).text())
          }
        })

        let  title = [];
        let detail = {}

        $(target.jobBox + " " +target.titles).each(function(index){
          if (index != 0) {
            title.push($(this).text().trim())
          }else{

          }
        })

        $(target.jobBox + " " +target.values).each(function(index){
          if (index != 0) {
            detail[title[index-1]] = $(this).text().trim()
          }else{

          }
        })

        let relation = [
          ["صنعت :", "typeOfJob"],
          ["نوع همکاری :", "typeOfCollaboration"],
          ["محل کار :", "location"],
          ["شرح شغل و وظایف", "descriptionOfJob"]
        ];

        for (var key in detail) {
          relation.forEach(function(item){
            if (item[0] == key) {
              final[item[1]] = detail[key]; //add other field and data to finall
            }
          })
        }
      }

      // console.log(final);

      index++;

      // jobModel.findOne({
      //     "url": final.url
      //   }, {
      //     "_id": 0,
      //     "url": 1
      //   }, function(err, item) {
      //     if (err) {
      //       console.log(">>>>>>>>>>>>>>>>>>>>>>> Database Error: cant find url of undefined " + err);
      //     }
      //
      //
      //     if (item == null && statusCode == 200) {
      //
      //       counter.findByIdAndUpdate({
      //         _id: "entityId"
      //       }, {
      //         $inc: {
      //           seq: 0.5
      //         }
      //       }, function(err, res) {
      //         if (err) throw err;
      //
      //         final.id = res.seq; // auto-increment id for our url
      //
      //       }).then(function(res) {
      //
      //         jobModel.insertMany(final,
      //           function(err, doc) {
      //             json[news] = final
      //             news++
      //
      //             console.log("job state " + index + " added !  /  with status code : " + statusCode);
      //
      //             if (index < target.jobPerPage) {
      //               getUrlDetails(object, urls, target)
      //             } else {
      //               index = 0;
      //               console.log("----------------------------------\n");
      //
      //               if (object.url.page < 200) {
      //                 object.url.page++;
      //                 generateUrl(object, object.url, target)
      //               } else {
      //                 console.log("scrap " + target.siteName + " done!!\n");
      //                 turn++;
      //                 start(sources, sites[turn])
      //               }
      //             }
      //           })
      //       });
      //
      //     } else {
      //       repeated++;
      //       console.log("repeted job!!  --> " + repeated);
      //       if (repeated < 10) { //limitForRepeated
      //         if (index < target.jobPerPage) {
      //           getUrlDetails(object, urls, target)
      //         } else {
      //           index = 0;
      //           console.log("----------------------------------\n");
      //
      //           if (object.url.page < 200) {
      //             object.url.page++;
      //             generateUrl(object, object.url, target)
      //           } else {
      //             console.log("scrap " + target.siteName + " done!!\n");
      //             turn++;
      //             start(sources, sites[turn])
      //           }
      //         }
      //       } else {
      //         console.log("can not find new job from " + target.siteName + '\n');
      //         turn++;
      //         start(sources, sites[turn])
      //       }
      //     }
      //   })
      //   .catch(function(error) {
      //     // handle error
      //     console.log(error);
      //   })
    })
}

var currentPage = 1;

app.get('/', function(req, res) {

  jobModel.find({
    "visibility": "NEW"
  }).count(function(err, result) {
    if (err)
      console.log(">>>>>>>>>>>>>>>>>>>>>>> Database Error: cant find url of undefined " + err);

    res.render(__dirname + '/views/panel', {
      news: result
    })
  })
});

app.get('/newjobs/:page', function(req, res) {
  let page = req.params.page
  let pageSize = 15

  currentPage = page

  jobModel.find({
    "visibility": "NEW"
  }, function(err, json) {
    if (err)
      console.log(">>>>>>>>>>>>>>>>>>>>>>>Database Error: cant find url of undefined " + err);

    res.json(json)
    page++
  }).skip(pageSize * (page - 1)).limit(pageSize)
});

app.post('/addNew', function(req, res) {
  console.log("new job visible");
  let newJob = JSON.parse(JSON.stringify(req.body));

  jobModel.update({
    "url": newJob.url
  }, {
    $set: {
      "visibility": "visible"
    }
  }, function(err, item) {
    if (err)

      console.log(item);

  })

  res.redirect('/newjobs/' + currentPage);
});

app.post('/newArchive', function(req, res) {
  console.log("new job hidden");
  let newArchive = JSON.parse(JSON.stringify(req.body));

  jobModel.update({
    "url": newArchive.url
  }, {
    $set: {
      "visibility": "hidden"
    }
  }, function(err, item) {
    if (err)

      console.log(item);

  })

  res.redirect('/newjobs/' + currentPage);
});
