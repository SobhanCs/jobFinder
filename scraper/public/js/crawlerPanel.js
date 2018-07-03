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

        // $("#items").append(
        //     '<div class="col-12 p-3 text-right">' +
        //         '<div class="card text-white bg-info mb-3">' +
        //             '<div class="card-header">' + typeof json[index].typeOfJob != "undefined" ? json[index].typeOfJob : "فیلد خالی" + '</div>' +
        //             '<div class = "card-body" >'+
        //                 '<h6>نام شرکت</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].companyName != "undefined" ? json[index].companyName : "فیلد خالی" +'</p>'+
        //                 '<h6>نوع همکاری</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].typeOfCollabration != "undefined" ? json[index].typeOfCollabration : "فیلد خالی" +'</p>'+
        //                 '<h6>مهارت های مورد نیاز</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].skill != "undefined" ? json[index].skill : "فیلد خالی" +'</p>'+
        //                 '<h6>جنسیت</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].sex != "undefined" ? json[index].sex : "فیلد خالی" +'</p>'+
        //                 '<h6>وضعیت نظام وضیفه</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].militeryService != "undefined" ? json[index].militeryService : "فیلد خالی" +'</p>'+
        //                 '<h6>توضیحات</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].description != "undefined" ? json[index].description : "فیلد خالی" +'</p>'+
        //                 '<h6>رشته های مربوط</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].relativeField != "undefined" ? json[index].relativeField : "فیلد خالی" +'</p>'+
        //                 '<h6>سابقه کار</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].minExperience != "undefined" ? json[index].minExperience : "فیلد خالی" +'</p>'+
        //                 '<h6>موقعیت مکانی</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].location != "undefined" ? json[index].location : "فیلد خالی" +'</p>'+
        //                 '<h6>تحصیلات</h6>'+
        //                 '<p class = "card-text" >'+ typeof json[index].education != "undefined" ? json[index].education : "فیلد خالی" +'</p>'+
        //             '</div>' +
        //         '</div>' +
        //     '</div>'
        // )
        $("#items").append(
            '<div class="col-12 p-3 text-right">' +
            '<div id = "jobId_' + index + '" class="shadow card text-white bg-secondary mb-3">' +
            '<div class="card-header"><a class="btn btn-info" role="button" href="' + json[index].url + '"><p class="secondary ml-2 mb-0" style="float:right"> - ' + index + '</p><p style="float:right;vertical-align:middle;margin-bottom:0;">' + json[index].typeOfJob + '</p></a>' +
            '<button onclick="addToArchive(' + index + ')" type="button" class="btn btn-danger mx-2 col-1" style="float:left">آرشیو</button>' +
            '<button onclick="addToDatabase(' + index + ')" type="button" class="btn btn-success ml-3 col-4" style="float:left">ثبت</button></div>' +

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
        $("#items > div").eq(index - 1).children().removeClass("bg-secondary").addClass("bg-danger")
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
        $("#items > div").eq(index - 1).children().removeClass("bg-secondary").addClass("bg-success")
    })
}