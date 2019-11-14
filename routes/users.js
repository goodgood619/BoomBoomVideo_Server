var express = require('express');
var router = express.Router();
var Book = require('../model/mongoPractice');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:title',(req,res)=> {
  // req.body는 post..., get으로 넘기면 당연히 params로 받아야함
  Book.find({ title : req.params.title},(err,book)=>{
    if(err) {
      console.log('findOne error :' + err);
      throw err;
    }
    console.log(book);
    res.send(200,book);
  });
});

// test commit
module.exports = router;
