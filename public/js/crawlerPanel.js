var outputJSON = {};
let currentPage = 1;
let pageNumber = 1;

$("#getnewJobs").on("click", function () {
    let url = "/newjobs/" + currentPage
    $.ajax({
        url: url,
        method: "get"
    }).done(function (data) {
        createNewJobs(data)
        outputJSON = data
        makePagination()
    });
})

function createNewJobs(json) {
    $("#items").html("")
    $("#items").hide()
    for (let index in json) {
        // console.log(json[index]);

        $("#items").append(
            '<div class="col-12 p-2 text-right">' +
            '<div id = "jobId_' + index + '" class="shadow card text-white bg-secondary mb-3 parent rounded">' +
            '<div class="card-header col-12" onclick="toggle(' + index + ',event)" style="cursor:pointer;border:none">' +
            '<div class="col-6 p-2 parent" style="float:right"><a class="btn btn-info col-12 Hover" role="button" href="' + json[index].url + '" target="_blank">' +
            '<p class="secondary ml-2 mb-0" style="float:right"> - ' + (+index + 1) + '</p>' +
            '<p style="float:right;vertical-align:middle;margin-bottom:0;">' + (json[index].title ? json[index].title: "تعریف نشده" ) + '</p></a></div>' +
            '<div class="col-3 p-2 parent" style="float:left" ><button onclick="addToArchive(' + index + ')" type="button" class="btn btn-danger col-12 Hover">پنهان</button></div>' +
            '<div class="col-3 p-2 parent" style="float:left" ><button onclick="addToDatabase(' + index + ')" type="button" class="btn btn-success col-12 Hover">تایید</button></div>'+
            '<div class="col-12 mt-2 d-flex justify-content-center">&#8645;</div></div>' +

            '<div class = "card-body row" id="body_' + index + '">' +
            '<div class = "col-2">'+
            '<h6>منبع</h6>' +
            '<p>'+ (json[index].siteName ? json[index].siteName: "تعریف نشده" ) +'</p><br>'+
            '<h6>لوگو شرکت</h6>' +
            '<img width="100%" height="150px" src="' + json[index].logoSource + '" style="float:left"></img>' +
            '</div><div class="col-5"><h6>وضعیت نظام وضیفه</h6>' +
            '<p class = "card-text" >' + (json[index].militeryService ? json[index].militeryService : "تعریف نشده") + '</p>' +
            '<h6>موقعیت مکانی</h6>' +
            '<p class = "card-text" >' + (json[index].location ? json[index].location : "تعریف نشده") + '</p>' +
            '<h6>تحصیلات</h6>' +
            '<p class = "card-text" >' + (json[index].education ? json[index].education : "تعریف نشده") + '</p>' +
            '<h6>رشته های مربوط</h6>' +
            '<p class = "card-text" >' + (json[index].relativeField ? json[index].relativeField : "تعریف نشده") + '</p>' +
            '<h6>حقوق</h6>' +
            '<p class = "card-text" >' + (json[index].Salary ? json[index].Salary : "تعریف نشده") + '</p>' +
            '<h6>مهلت ارسال رزومه</h6>' +
            '<p class = "card-text" >' + (json[index].expireTime ? json[index].expireTime : "تعریف نشده") + '</p>' +
            '</div><div class="col-5"><h6>دسته بندی</h6>' +
            '<p class = "card-text" >' + (json[index].typeOfJob ? json[index].typeOfJob : "تعریف نشده") + '</p>' +
            '<h6 >نام شرکت</h6>' +
            '<p class = "card-text" >' + (json[index].companyName ? json[index].companyName : "تعریف نشده") + '</p>' +
            '<h6>نوع همکاری</h6>' +
            '<p class = "card-text" >' + (json[index].typeOfCollaboration ? json[index].typeOfCollaboration : "تعریف نشده") + '</p>' +
            '<h6>مهارت های مورد نیاز</h6>' +
            '<p class = "card-text" >' + (json[index].skill ? json[index].skill : "تعریف نشده") + '</p>' +
            '<h6>جنسیت</h6>' +
            '<p class = "card-text" >' + (json[index].sex ? json[index].sex : "تعریف نشده") + '</p>' +
            '<h6>سابقه کار</h6>' +
            '<p class = "card-text" >' + (json[index].minExperience ? json[index].minExperience : "تعریف نشده") + '</p>' +
            '</div><div class="col-12 mt-4"><h6>توضیحات شغل</h6>' +
            '<p class = "card-text" >' + (json[index].descriptionOfJob ? json[index].descriptionOfJob : "تعریف نشده") + '</p>' +
            '<h6>معرفی شرکت</h6>' +
            '<p class = "card-text" >' + (json[index].descriptionOfCompany ? json[index].descriptionOfCompany : "تعریف نشده") + '</p></div>' +
            '</div>' +
            '</div>' +
            '</div>'
        )

        $("#body_" + index).hide()
    }
    $("#items").slideDown(1000)
}
//pagination jquery nodejs
//use jquery for make pagination DOM
var pageSize = 15
function makePagination() {
    $(".items").html("")
    let pages = Math.ceil($(".badge").text() / pageSize)
    pageNumber = pages;
    if (pages > 1) {
        $(".items").append('<a onclick="prevPage()" >&laquo;</a>')
        for (let i = 1; i < pages + 1; i++) {
            if (currentPage == i) {
                $(".items").append('<a class="active" id="page_' + i + '" onclick="getThisPage(' + i + ')">' + i + '</a>')
            } else {
                $(".items").append('<a id="page_' + i + '" onclick="getThisPage(' + i + ')">' + i + '</a>')
            }

        }
        $(".items").append('<a onclick="nextPage()" >&raquo;</a>')
    }
}
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//call API for get jobs of current page
function getThisPage(page) {
    currentPage = page
    let url = "/newjobs/" + page

    $(".active").removeClass("active")
    $("#page_" + page).addClass("active")

    $.ajax({
        url: url,
        method: "get"
    }).done(function (data) {
        createNewJobs(data)
        outputJSON = data
    });
}
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//next sign in pagination call this function
function nextPage() {
    if (currentPage != pageNumber) {
        getThisPage(currentPage + 1)
    }
}
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//previos sign in pagination call this function
function prevPage() {
    if (currentPage != 1) {
        getThisPage(currentPage - 1)
    }
}
//end pagination
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//onclick for button (پنهان) => use ajax and connect to database
function addToArchive(index) {

    $.ajax({
        method: "POST",
        url: "/newArchive",
        contentType: 'application/json',
        data: JSON.stringify(outputJSON[index]),
    }).then(function () {
        console.log("this job added to archive");
        $("#items > div").eq(index).children().removeClass("bg-secondary").removeClass("bg-success").addClass("bg-danger")
    })
}
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//onclick for button (تایید) => use ajax and connect to database
function addToDatabase(index) {

    $.ajax({
        method: "POST",
        url: "/addNew",
        contentType: 'application/json',
        data: JSON.stringify(outputJSON[index]),
    }).then(function () {
        console.log("this job added to database");
        $("#items > div").eq(index).children().removeClass("bg-secondary").removeClass("bg-danger").addClass("bg-success")
    })
}
//<<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>><<<<<<>>>>>>
//onclick on header of jobs for slide in and show more
function toggle(card,e) {
    if(e.target.innerHTML != "پنهان" & e.target.innerHTML != "تایید")

    $("#body_" + card).slideToggle(400)
}
