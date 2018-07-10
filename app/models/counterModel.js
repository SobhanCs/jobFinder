var mongoose = require('mongoose');

var CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number}
});

module.exports = mongoose.model('counter', CounterSchema, 'counter');
