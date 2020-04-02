const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const boardreplydb = new Schema({
    boardnumber : Number,
    relikenumber : Number,
    reauthor : "",
    recontent : "",
    repassword : "",
    re_reportcnt : Number
});

autoIncrement.initialize(mongoose.connection);
boardreplydb.plugin(autoIncrement.plugin,{
    model : 'boardReply',
    field : 'reboardnumber',
    startAt : 1,
    increment : 1
});

module.exports = mongoose.model('boardReply',boardreplydb);