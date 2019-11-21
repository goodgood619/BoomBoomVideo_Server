var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageaxiosdb = new Schema({
    key: Number,
    fieldname : "",
    originalname : "",
    encoding : "",
    mimetype : "",
    destination : "",
    filename : "",
    path : "",
    size : Number
})
module.exports = module.exports = mongoose.model('imagedata',imageaxiosdb);