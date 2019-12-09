const express = require('express');
const router = express.Router();
const axios = require('../model/axiosTestDB');
const imageaxios = require('../model/axiosfileDB');
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Promise = require('es6-promise');
const puppeteer = require('puppeteer');
const ip = require('ip');
var ipinstance = require('./Singleton');

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
                const saveimage = [];
                for(var i =0 ;i<req.files.length; i++) {
                    const fileimage = new imageaxios({key:1,fieldname : req.files[i].fieldname,originalname : req.files[i].originalname,
                        encoding : req.files[i].encoding, mimetype : req.files[i].mimetype, destination : req.files[i].destination,
                        filename : req.files[i].filename, path : req.files[i].path, size : req.files[i].size});
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
});


router.get('/videoupload',(req,res)=> {
    //req.query.path = video이름
    const streamname = req.query.path;
    const streampath = '/home/alcuk1/IdeaProjects/testApp/public/videos/' + streamname + '.mp4';
    var stream = fs.createReadStream(streampath);
    var count = 0;
    stream.on('data',(data)=>{
        count ++;
        console.log('data count='+count);
        res.write(data);
    })

    stream.on('end',()=>{
        console.log('end streaming');
        res.end();
    })

    stream.on('error',(err)=>{
        console.log(err)
        res.end('500 Internal Server '+err)
    })
});

router.post('/saveboard',async (req,res)=> {
    let url = req.body.linkaddress
    var async1 =  ()=>{
        return new Promise((fulfilled,rejected)=>{
            puppeteer.launch({headless: true}).then(async browser => {
                const page = await browser.newPage();
                await page.goto(url);
                try {
                    await page.waitForSelector('div h1');
                    await page.waitForSelector('div ytd-video-owner-renderer div ytd-channel-name div div yt-formatted-string a');
                    const title = await page.evaluate(()=> document.querySelector('div h1').textContent);
                    const who = await page.evaluate(()=>document.querySelector('div ytd-channel-name div div yt-formatted-string a').textContent);
                    // console.log(title)
                    // console.log(who)
                    fulfilled({title,who})
                }
                catch(err){
                    // console.log(err)
                    rejected(err)
                }
            })
        })
    };

    var async2 = () =>{
        return new Promise((done,reject)=>{
            if(url.match("watch")){
                const linkaddress = url.substring(url.indexOf('=')+1,url.size);
                const data = 'https://www.youtube.com/embed/' + linkaddress;
               // console.log(data)
                done(data)
            }
            else {
                const linkaddress = url.substring(url.indexOf('.be')+4,url.size);
                const data = 'https://www.youtube.com/embed/' + linkaddress;
                //console.log(data)
                done(data)
            }
        })
    };

    async1().then(({title,who})=> {
        async2().then((linkaddress)=>{
            const boardcontentdb = new boardcontent({category : req.body.category,likenumber: 0, dislikenumber : 0 , linkaddress: linkaddress,
                title : req.body.title, author : req.body.author , password : req.body.password ,reportcnt : 0,
                iframetoggle : false,replytoggle : false,linkauthor : who, linktitle : title});
            boardcontentdb.save((err,obj) => {
                if(err) {
                    console.log(err);
                    throw err
                }
                res.json({test: obj})
            })
        })
    }).catch((error)=>{
        console.log(error);
        res.json({err : error})
    })
});

router.post('/savereply',(req,res)=>{
    const boardreplydb = new boardreply({boardnumber : req.body.boardnumber, relikenumber: 0, reauthor : req.body.reauthor,
    recontent : req.body.recontent, repassword: req.body.repassword,re_reportcnt: 0});
    boardreplydb.save((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        res.json({test : 'ok'});
    })
});
router.post('/saverereply',(req,res)=>{
    const boardrereplydb = new boardrereply({reboardnumber : req.body.boardreplynumber,rerelikenumber: 0,rereauthor: req.body.rereauthor,
    rerecontent : req.body.rerecontent, rerepassword: req.body.rerepassword, re_reportcnt: 0});
    boardrereplydb.save((err,data)=>{
        if(err){
            console.log(err)
            throw err
        }
        res.json({test: 'ok'})
    })
})

router.post('/dataupload',async (req,res)=> {
    const page = req.body.page;
    const value1 = [],value2 = [], value3 = [],value4 = [];
    // boardcontent 내용들
    var findboardcontent = () => {
        return new Promise((fulfilled, rejected) => {
            boardcontent.find().limit(page * 3 + 3).skip(page * 3).exec((err, data) => {
                if (err) {
                    console.log(err)
                    rejected(err)
                    throw err
                }
                fulfilled(data)
            })
        })
    };
    //total boardcontent갯수
    var totalboardcontent = ()=> {
        return new Promise((fulfilled,rejected)=>{
            boardcontent.countDocuments().exec((err,data)=>{
                if(err){
                    console.log(err)
                    rejected(err)
                    throw err
                }
                fulfilled(data)
            })
        })
    };
    // 댓글갯수
    var replycontent = (data) => {
        if(data.length == 1) {
            return new Promise((ok, no) => {
                boardreply.find({$or: [{boardnumber: data[0].boardnumber}]}).exec((err, data) => {
                    if (err) {
                        console.log(err)
                        no(err)
                        throw err
                    }
                    ok(data)
                })
            })
        }
        else if(data.length == 2) {
            return new Promise((ok, no) => {
                boardreply.find({$or: [{boardnumber: data[0].boardnumber}, {boardnumber: data[1].boardnumber}]}).exec((err, data) => {
                    if (err) {
                        console.log(err)
                        no(err)
                        throw err
                    }
                    ok(data)
                })
            })
        }
        else if(data.length == 3) {
            return new Promise((ok, no) => {
                boardreply.find({$or: [{boardnumber: data[0].boardnumber}, {boardnumber: data[1].boardnumber}, {boardnumber: data[2].boardnumber}]}).exec((err, data) => {
                    if (err) {
                        console.log(err)
                        no(err)
                        throw err
                    }
                    ok(data)
                })
            })
        }
    };

    //대댓글갯수
    var rereplycontent = ()=> {
        return new Promise((ok,no)=>{
            boardrereply.find({}).exec((err,data)=>{
                if(err){
                    console.log(err);
                    no(err);
                    throw err;
                }
                ok(data)
            })
        })
    };

    var a = findboardcontent().then((data)=>{
       // console.log(data);
        value1.push({uploaddata: data});
        return replycontent(data)
    }).then((data)=>{
        //console.log(data)
        value2.push({reply: data})
    }).catch((err)=>console.log(err));

    var b = totalboardcontent().then((data)=>{
        value3.push({totalboardcnt: data})
    });

    var c = rereplycontent().then((data)=>{
        value4.push({rereply : data})
    });

    Promise.all([a,b,c]).then(()=>{
        res.json({
            uploaddata : value1, replydata : value2,
            totalboardcontent : value3, rereplydata : value4
        })
    })
});

router.post('/removeboardcontent',(req,res)=>{
    // 입력했을때 비밀번호를 받아서 그것이 일치하면 지우고,아니면 못지움
    var async1 = () =>{
        return new Promise((ok,reject)=>{
            if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(), like: 'likenumber',boardnumber : req.body.boardnumber}))){
                ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(), like: 'likenumber',boardnumber : req.body.boardnumber}));
            }
            ok('1')
        })
    };
    var async2 = () => {
        return new Promise((ok,reject)=>{
            if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(),dislike: 'dislikenumber',boardnumber : req.body.boardnumber}))){
                ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(),dislike: 'dislikenumber',boardnumber : req.body.boardnumber}));
            }
            ok('2')
        })
    };
    var async3 = ()=>{
        return new Promise((ok,reject)=>{
            if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(),reportcnt: 'reportcnt',boardnumber : req.body.boardnumber}))){
                ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(), reportcnt: 'reportcnt',boardnumber : req.body.boardnumber}), 1);
            }
            ok('3');
        })
    };
    boardcontent.deleteOne({boardnumber : req.body.boardnumber,password: req.body.password}).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        if(data.deletedCount == 1) {
            async1().then((data)=>{
                if(data == '1') {
                    async2().then((data)=>{
                        if(data == '2'){
                            async3.then()
                        }
                    })
                }
            }).catch(err)
            res.json({test:'removeboardcontent ok'});
        }
        else {
            res.json({test : '비밀번호가 틀렸습니다. 다시 입력해주세요'});
        }
        console.log(data);
    })
});

router.post('/nextpagination',(req,res)=>{
    const page = req.body.page;
    boardcontent.find().limit(3).skip(page*3).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        res.json({test:data});
    })
});
router.post('/pastpagination',(req,res)=>{
    const page = req.body.page;
    boardcontent.find().limit(3).skip(page*3).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        res.json({test:data});
    })
});

router.post('/likeboardcontent',async (req,res)=>{

    // 그냥 api저장하는 table을 만들자..
    console.log(ip.address());
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),like : 'likenumber',boardnumber : req.body.boardnumber}))){
        res.json({test: 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), like: 'likenumber',boardnumber : req.body.boardnumber}), 1);
        // boardnumber 받아서 증가시키면됨
        var likenumber = req.body.likenumber;
        likenumber++;
        boardcontent.findOneAndUpdate({boardnumber: req.body.boardnumber}, {likenumber: likenumber}, {
            new: true
        }).exec((err, data) => {
            if (err) {
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});
router.post('/likereplycontent', async (req,res)=>{
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : req.body.reboardnumber}))){
        res.json({test: 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), like: 'likenumber',reboardnumber : req.body.reboardnumber}), 1);
        // boardnumber 받아서 증가시키면됨
        var likenumber = req.body.relikenumber;
        likenumber++;
        boardreply.findOneAndUpdate({reboardnumber: req.body.reboardnumber}, {relikenumber: likenumber}, {
            new: true
        }).exec((err, data) => {
            if (err) {
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});
router.post('/likerereplycontent',async (req,res)=>{
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),like : 'likenumber',rereboardnumber : req.body.rereboardnumber}))){
        res.json({test: 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), like: 'likenumber',rereboardnumber : req.body.rereboardnumber}), 1);
        // boardnumber 받아서 증가시키면됨
        var likenumber = req.body.rerelikenumber;
        likenumber++;
        boardrereply.findOneAndUpdate({rereboardnumber: req.body.rereboardnumber}, {rerelikenumber: likenumber}, {
            new: true
        }).exec((err, data) => {
            if (err) {
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});

router.post('/dislikeboardcontent',async (req,res)=> {
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),dislike : 'dislikenumber',boardnumber : req.body.boardnumber}))) {
        res.json({test :'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), dislike: 'dislikenumber',boardnumber : req.body.boardnumber}), 1);
        var dislikenumber = req.body.dislikenumber;
        dislikenumber++;
        boardcontent.findOneAndUpdate({boardnumber: req.body.boardnumber}, {dislikenumber: dislikenumber}, {
            new: true
        }).exec((err, data) => {
            if (err) {
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});

router.post('/reportcntcontent',async (req,res)=> {
    // 신고가 5회이상들어오면 게시물삭제
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),reportcnt : 'reportcnt',boardnumber :req.body.boardnumber}))) {
        res.json({test : 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), reportcnt: 'reportcnt',boardnumber : req.body.boardnumber}), 1);
        var reportcnt = req.body.reportcnt;
        reportcnt++
        boardcontent.findOneAndUpdate({boardnumber :req.body.boardnumber},{reportcnt : reportcnt},{new : true}).exec((err,data)=>{
            if(err){
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});

module.exports = router;