var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

const boardrereplydb = new Schema({
    boardnumber : Number,
    reboardnumber : Number,
    rerelikenumber : Number,
    rereauthor : "",
    rerecontent : "",
    rerepassword : "",
    rere_reportcnt : Number
});

autoIncrement.initialize(mongoose.connection)

boardrereplydb.plugin(autoIncrement.plugin,{
    model : 'boardRereply',
    field : 'rereboardnumber',
    startAt : 1,
    increment : 1
});

module.exports = mongoose.model('boardRereply',boardrereplydb);