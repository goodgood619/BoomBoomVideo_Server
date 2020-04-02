const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: String,
    author: String,
    published_date: {type: Date, default: Date.now()}
});
//book의 경우 전부 소문자가 된다음 s가 뒤에 붙어서 books로 된다. 이 books는 mongodb의 collection name이 된다!!
module.exports = mongoose.model('book',bookSchema);