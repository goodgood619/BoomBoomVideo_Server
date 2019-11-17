var express = require('express');
var router= express.Router();
var fs = require('fs');
var async = require('async');

var src = '/home/alcuk1/IdeaProjects/testApp/public/images/myfile3-1573978064908.cpp';
var des = '/home/alcuk1/IdeaProjects/testApp/public/images/myfile3-1573978321175.txt';
router.get('/waterfall',(res,req)=>{
    async.waterfall([
            test1,test2,
        ],
        (err,result)=> {
        if(err) {
            console.log(err);
            throw err;
        }
        console.log('async waterfall ok : '+ result);
        });

function test1(cb) {
    fs.readFile(src,cb);
}
 function test2(arg1,cb) {
    console.log('전달된 인자값 : '+ arg1);
    // 목적지, data, callback
    fs.writeFile(des,arg1,cb(null,'done'));
}

});


router.get('/series',(res,req)=>{
   async.series([
       series_test1, series_test2,
   ], 
       (err,result)=>{
            if(err) {
                console.log(err);
                throw err;
            }       
            console.log(result);
       });
   function series_test1(callback) {
       // error, arg1, arg2, ...
       callback(null,'series1','series2')
   }
   function series_test2(callback) {
       callback(null,'series3','series4','series5');
   }
});


router.get('/parallel',(res,req)=>{
   async.parallel([
       parallel_test1,parallel_test2, parallel_test3
   ],
       (err,result)=>{
            if(err) {
                console.log(err);
                throw err;
            }
            console.log(result);
       });
   function parallel_test1(callback) {
       callback(null,'ok1','ok1-1','ok1-2','ok1-3','ok1-4','ok1-5','ok1-6');
   }
   function parallel_test2(callback) {
       callback(null,'ok2','ok2-1','ok2-2');
   }
   function parallel_test3(callback) {
       callback(null,'ok3','ok3');
   }
});


module.exports = router;