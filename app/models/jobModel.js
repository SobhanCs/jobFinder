var mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
    url: {
        type: String,
        require: true
    }, // target url
    id: {
        type: Number,
        require: true,
        default: 0
    }, // use the link of job as id
    title: String,

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
    siteName: String,
    companyName: {
        type: String,
        require: true
    },
    descriptionOfJob: String,
    descriptionOfCompany: String,
    expireTime: String,
    crawlTime: String,
    experience: String,
    logoSource: String,
    visibility: String,
    minExperience: String,
    maritalStatus: String,
    minAge:String,
    maxAge:String
});

module.exports = mongoose.model("jobModel", jobSchema, 'jobModel'); // the name of collection by erfan
