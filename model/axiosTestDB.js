var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var axiosTestSchema = new Schema({
    id : String,
    pwd : String,
    num : Number,
    date : {type:Date, default : Date.now()},
    test : []
});

module.exports = mongoose.model('vuedata',axiosTestSchema);
