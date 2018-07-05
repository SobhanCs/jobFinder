var mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
    url: {
        type: String,
        require: true
    }, // target url
    id: {
        type: String,
        require: true
    }, // use the link of job as id
    title: {
        type: String,
        require: true
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

module.exports = mongoose.model("jobModel", jobSchema, 'jobModel'); // the name of collection by erfan
