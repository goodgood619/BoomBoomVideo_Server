const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const boardcontentdb = new Schema({
    category : "",
    likenumber : Number,
    dislikenumber : Number,
    linkaddress: "",
    videolinkaddress : "",
    title : "",
    author : "",
    password : "",
    reportcnt : Number,
    iframetoggle : false,
    replytoggle : false,
    linkauthor : "",
    linktitle : "",
    reg_dt : {
        type : Date,
        default : Date.now
    }
})

autoIncrement.initialize(mongoose.connection)

boardcontentdb.plugin(autoIncrement.plugin,{
    model : 'boardContent',
    field : 'boardnumber',
    startAt : 1,
    increment : 1
})

module.exports = mongoose.model('boardContent',boardcontentdb)