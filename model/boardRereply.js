var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const boardrereplydb = new Schema({
    reboardnumber : Number,
    rerelikenumber : Number,
    reretitle : "",
    rereauthor : "",
    rerecontent : "",
    rerepassword : "",
    rere_reportcnt : Number
})

autoIncrement.initialize(mongoose.connection)

boardrereplydb.plugin(autoIncrement.plugin,{
    model : 'boardRereply',
    field : 'rereboardnumber',
    startAt : 1,
    increment : 1
})

module.exports = mongoose.model('boardRereply',boardrereplydb)