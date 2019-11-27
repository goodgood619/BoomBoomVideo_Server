var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment')

const boardcontentdb = new Schema({
    category : "",
    likenumber : Number,
    dislikenumber : Number,
    linkaddress : "",
    title : "",
    author : "",
    password : "",
    reportcnt : Number,
    iframetoggle : false
})

autoIncrement.initialize(mongoose.connection)

boardcontentdb.plugin(autoIncrement.plugin,{
    model : 'boardContent',
    field : 'boardnumber',
    startAt : 1,
    increment : 1
})

module.exports = mongoose.model('boardContent',boardcontentdb)