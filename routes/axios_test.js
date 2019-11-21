var express = require('express');
var router = express.Router();
var axios = require('../model/axiosTestDB');
var imageaxios = require('../model/axiosfileDB')
var multer = require('multer');
var path = require('path');
router.get('/axios',(req,res)=> {

    // console.log('req body test', req.body.test);
    res.json({test: 'axios ok1', msg : 'axios ok2'});
});

router.post('/axiospost',(req,res)=>{
    const tarray = ["efdg","abc",1];
    const axiosdb = new axios({id:req.body.id,pwd : req.body.pwd,num : req.body.num,test:tarray})
    axiosdb.save((err)=>{
        if(err){
            console.log(err);
            throw err;
        }
        res.json({test : 'axios post db ok'})
    })
});

router.post('/axiosdelete',(req,res)=>{
    axios.remove({id : req.body.id},(err)=>{
        if(err) {
            console.log(err);
            throw err;
        }
        res.json({test: 'axios delete ok'});
    })
});
router.get('/axiosfind',(req,res)=>{
    axios.find((err,data)=>{
        if(err) {
            console.log(err);
            throw err;
        }
        res.json({test:data});
    })
})


router.post('/imageupload',(req,res)=>{
    const storage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,'public/images/');
        },
        filename: function (req,file,cb) {
            cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    function checkFileType(file,cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if(mimetype && extname) {
            return cb(null,true);
        } else{
            cb('error : images only');
        }

    }
    const upload = multer({
        storage: storage ,
        fileFilter : function (req,file,cb) {
            checkFileType(file,cb);
        }
    }).array('myfile3',10);

    upload(req,res,(err)=>{
        if(err) {
            res.json({test: err});
            console.log(err);
            throw err;
        }
        else {
            if(req.files === undefined) {
                res.json({test: 'error: no files selected!'});
            } else {
                const saveimage = []
                for(var i =0 ;i<req.files.length; i++) {
                    const fileimage = new imageaxios({key:1,fieldname : req.files[i].fieldname,originalname : req.files[i].originalname,
                        encoding : req.files[i].encoding, mimetype : req.files[i].mimetype, destination : req.files[i].destination,
                        filename : req.files[i].filename, path : req.files[i].path, size : req.files[i].size})
                    saveimage[i] = fileimage
                }
                imageaxios.insertMany(saveimage,(err)=>{
                    if(err){
                        console.log(err);
                        throw err;
                    }
                })
                res.set({'content-type':'text/html; charset=utf-8'});
                let multiplesend = [];
                for(var i =0 ;i<req.files.length;i++){
                    let upload = '/images/' + req.files[i].filename;
                    multiplesend.push(upload);
                }
                // var testpath = req.files;
                // var upload = '/images/'+testpath;
                res.json({
                    file : multiplesend,
                    test : 'ok'
                })
            }
        }
    });
})

module.exports = router;