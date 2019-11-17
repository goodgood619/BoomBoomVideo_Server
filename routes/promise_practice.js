var express = require('express');
var router = express.Router();
var Promise = require('es6-promise');

router.get('/',(req,res)=> {

    var asyncfunction1 = (param)=>{
        return new Promise((fullfilled,rejected)=>{
            setTimeout(
                function(){
                    fullfilled('result 1:'+param);
                },1000);
        });
    };

    var asyncfunction2 = (param)=>{
        return new Promise((fullfilled,rejected)=>{
            setTimeout(
                function(){
                    fullfilled('result 2:'+param);
                },4000);
        });
    };

    var asyncfunction3 = (param)=>{
        return new Promise((fullfilled,rejected) => {
            setTimeout(
                function(){
                    fullfilled('result 3:'+ param);
                },2000);
        });
    };

    var asyncfunction4 = (param) =>{
      return new Promise((ok,bad)=>{
        setTimeout(()=>{
            bad(Error('this is err '+ param));
        },2000);
      });
    };
    var promise = asyncfunction1(' terry ');
    promise
        .then(asyncfunction2)
        .then(asyncfunction3)
        .then(console.log);

    var errorpromise = asyncfunction4('badbad');

    errorpromise.then(console.log)
        .catch(console.error);

    errorpromise.then(console.log,console.error);
});



module.exports = router;