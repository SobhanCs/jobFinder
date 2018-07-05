var outputJSON = {};

$("#getnewJobs").on("click", function () {
    console.log("request sent");
    $.ajax({
        url: "/news",
        method: "get"
    }).done(function (data) {
        createNewJobs(data)
        outputJSON = data
    });
})

function createNewJobs(json) {
    $("#items").html("")
    for (let index in json) {
        console.log(json[index]);

        $("#items").append(
            '<div class="col-12 p-3 text-right">' +
            '<div id = "jobId_' + index + '" class="shadow card text-white bg-secondary mb-3">' +
            '<div class="card-header"><a class="btn btn-info" role="button" href="' + json[index].url + '" target="_blank"><p class="secondary ml-2 mb-0" style="float:right"> - ' + index + '</p><p style="float:right;vertical-align:middle;margin-bottom:0;">' + json[index].typeOfJob + '</p></a>' +
            '<button onclick="addToArchive(' + index + ')" type="button" class="btn btn-danger mx-2 col-2" style="float:left">پنهان</button>' +
            '<button onclick="addToDatabase(' + index + ')" type="button" class="btn btn-success ml-3 col-3" style="float:left">تایید</button></div>' +

            '<div class = "card-body row" >' +
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
            '</div><div class="col-5"><h6 >نام شرکت</h6>' +
            '<p class = "card-text" >' + json[index].companyName + '</p>' +
            '<h6>نوع همکاری</h6>' +
            '<p class = "card-text" >' + json[index].typeOfCollabration + '</p>' +
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
    }
}

function addToArchive(index) {
    // console.log(outputJSON[index]);

    $.ajax({
        method: "POST",
        url: "/newArchive",
        contentType: 'application/json',
        data: JSON.stringify(outputJSON[index]),
    }).then(function () {
        console.log("this job added to archive");
        $("#items > div").eq(index - 1).children().removeClass("bg-secondary").removeClass("bg-success").addClass("bg-danger")
    })
}

function addToDatabase(index) {
    // console.log(outputJSON[index]);

    $.ajax({
        method: "POST",
        url: "/addNew",
        contentType: 'application/json',
        data: JSON.stringify(outputJSON[index]),
    }).then(function () {
        console.log("new job added");
        $("#items > div").eq(index - 1).children().removeClass("bg-secondary").removeClass("bg-danger").addClass("bg-success")
    })
}