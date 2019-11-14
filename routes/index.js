var express = require('express');
var router = express.Router();
var Book = require('../model/mongoPractice');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if(!req.session.aa) {
    req.session.aa = 1;
  }
  else req.session.aa = req.session.aa + 1;
  res.sendFile(__dirname+ '/index.html');
});


router.post('/create',(req,res) => {
    var book = new Book({title:req.body.title,author : req.body.author});
    book.save((err) => {
        if(err) {
            console.log(err);
            throw err;
        }
        res.redirect('/');
    });
});

router.post('/delete',(req,res) => {
    Book.remove({title : req.body.title},(err) => {
        if(err) {
            console.log(err);
            throw err;
        }
        console.log('삭제 완료');
        res.redirect('/');
    });
});

module.exports = router;
