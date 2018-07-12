var outputJSON = {};
let currentPage = 1;
let pageNumber = 1;

$("#getnewJobs").on("click", function () {
    let url = "/newjobs/" + 1
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
            '<div id = "jobId_' + index + '" class="shadow card text-white bg-secondary mb-3">' +
            '<div class="card-header col-12 " onclick="toggle(' + index + ')">' +
            '<div class="col-6 p-2" style="float:right"><a class="btn btn-info col-12" role="button" href="' + json[index].url + '" target="_blank">' +
            '<p class="secondary ml-2 mb-0" style="float:right"> - ' + (+index + 1) + '</p>' +
            '<p style="float:right;vertical-align:middle;margin-bottom:0;">' + json[index].title + '</p></a></div>' +
            '<div class="col-3 p-2" style="float:left" ><button onclick="addToArchive(' + index + ')" type="button" class="btn btn-danger col-12">پنهان</button></div>' +
            '<div class="col-3 p-2" style="float:left" ><button onclick="addToDatabase(' + index + ')" type="button" class="btn btn-success col-12">تایید</button></div></div>' +

            '<div class = "card-body row" id="body_' + index + '">' +
            '<img width="100%" height="150px" class="col-2" src="' + json[index].logoSource + '" style="float:left"></img>' +
            '<div class="col-5"><h6>وضعیت نظام وضیفه</h6>' +
            '<p class = "card-text" >' + json[index].militeryService + '</p>' +
            '<h6>موقعیت مکانی</h6>' +
            '<p class = "card-text" >' + json[index].location + '</p>' +
            '<h6>تحصیلات</h6>' +
            '<p class = "card-text" >' + json[index].education + '</p>' +
            '<h6>رشته های مربوط</h6>' +
            '<p class = "card-text" >' + json[index].relativeField + '</p>' +
            '<h6>حقوق</h6>' +
            '<p class = "card-text" >' + json[index].salary + '</p>' +
            '</div><div class="col-5"><h6>دسته بندی</h6>' +
            '<p class = "card-text" >' + json[index].typeOfJob + '</p>' +
            '<h6 >نام شرکت</h6>' +
            '<p class = "card-text" >' + json[index].companyName + '</p>' +
            '<h6>نوع همکاری</h6>' +
            '<p class = "card-text" >' + json[index].typeOfCollaboration + '</p>' +
            '<h6>مهارت های مورد نیاز</h6>' +
            '<p class = "card-text" >' + json[index].skill + '</p>' +
            '<h6>جنسیت</h6>' +
            '<p class = "card-text" >' + json[index].sex + '</p>' +
            '<h6>سابقه کار</h6>' +
            '<p class = "card-text" >' + json[index].minExperience + '</p>' +
            '</div><div class="col-12 mt-4"><h6>توضیحات شغل</h6>' +
            '<p class = "card-text" >' + json[index].descriptionOfJob + '</p>' +
            '<h6>معرفی شرکت</h6>' +
            '<p class = "card-text" >' + json[index].descriptionOfCompany + '</p></div>' +
            '</div>' +
            '</div>' +
            '</div>'
        )

        $("#body_" + index).hide()
    }
    $("#items").slideDown(1000)
}
//pagination jquery nodejs
function makePagination() {
    let pages = Math.ceil($(".badge").text() / 15)
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

function nextPage() {
    if (currentPage != pageNumber) {
        getThisPage(currentPage + 1)
    }
}

function prevPage() {
    if (currentPage != 1) {
        getThisPage(currentPage - 1)
    }
}
//end pagination
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

function toggle(card) {
    $("#body_" + card).slideToggle(1300)
}