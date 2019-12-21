const express = require('express');
const router = express.Router();
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const Promise = require('es6-promise');
const puppeteer = require('puppeteer');
var ipinstance = require('./Singleton');
const ip = require('ip');

var findreplycontent = (boardnumber) => {
    return new Promise((ok,no)=>{
        boardreply.find({boardnumber : boardnumber}).exec((err,data)=>{
            if(err) {
                console.log(err);
                no(err);
                throw err;
            }
            ok(data);
        })
    })
};

async function findrereplycontent(data) {
    let ret = [];
    for (let i = 0;i<data.length;i++) {
        await boardrereply.find({reboardnumber : data[i]._doc.reboardnumber}).then((data2)=> {
            for(let j = 0 ;j<data2.length;j++) {
                ret.push(data2[j]._doc);
            }
        });
    }
    return ret;
}

var singlefindrereply = (reboardnumber) =>{
    return new Promise((ok,no)=>{
        boardrereply.find({reboardnumber : reboardnumber}).exec((err,data)=>{
            if(err) {
                console.log(err);
                no(err);
                throw err;
            }
            ok(data);
        })
    })
};

// likeerase, dislikeerase, reporterase, replylikeerase, rereplylikeerase, replyreporterase, rereplyreporterase(IP 좋아요 싫어요등 테이블 관리)
var likeerase = (boardnumber) =>{
    return new Promise((ok,reject)=>{
        if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(), like: 'likenumber',boardnumber : boardnumber}))){
            ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(), like: 'likenumber',boardnumber : boardnumber}));
        }
        ok('1')
    })
};
var dislikeerase = (boardnumber) => {
    return new Promise((ok,reject)=>{
        if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(),dislike: 'dislikenumber',boardnumber : boardnumber}))){
            ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(),dislike: 'dislikenumber',boardnumber : boardnumber}));
        }
        ok('2')
    })
};

var reporterase = (boardnumber)=>{
    return new Promise((ok,reject)=> {
        if(ipinstance.getInstance().get(JSON.stringify({IP: ip.address(),reportcnt: 'reportcnt',boardnumber : boardnumber}))){
            ipinstance.getInstance().remove(JSON.stringify({IP: ip.address(), reportcnt: 'reportcnt',boardnumber : boardnumber}));
        }
        ok('3');
    })
};

var multireplylikeerase = (data) => {
    return new Promise((ok,no)=> {
        for(let i = 0 ; i<data.length;i++) {
            const reboardnum = data[i]._doc.reboardnumber
            if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : reboardnum}))) {
                ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : reboardnum}));
            }
        }
        ok('1')
    })
};
var multireplyreporterase = (data) => {
    return new Promise((ok,no)=> {
        for(let i  = 0 ;i<data.length;i++) {
            const reboardnum = data[i]._doc.reboardnumber;
            if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),re_reportcnt : 're_reportcnt',reboardnumber : reboardnum}))) {
                ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),re_reportcnt : 're_reportcnt',reboardnumber : reboardnum}));
            }
        }
        ok('1')
    })
};
var singlereplylikerase = (reboardnumber) => {
    return new Promise((ok,no)=>{
        if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : reboardnumber}))) {
            ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : reboardnumber}));
        }
        ok('1')
    })
};
var singlereplyreporterase = (reboardnumber) => {
    if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),re_reportcnt : 're_reportcnt',reboardnumber : reboardnumber}))) {
        ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),re_reportcnt : 're_reportcnt',reboardnumber : reboardnumber}));
    }
};
async function multirereplylikeerase(data){
        for(let i = 0;i<data.length; i++) {
            const rereboardnum = data[i].rereboardnumber
            if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),like : 'likenumber',rereboardnumber : rereboardnum}))){
                ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),like : 'likenumber',rereboardnumber : rereboardnum}));
            }
        }
};

async function multirereplyreporterase(data) {
        for(let i = 0 ;i<data.length;i++){
            const rereboardnum = data[i].rereboardnumber
            if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),rere_reportcnt : 'rere_reportcnt',rereboardnumber : rereboardnum}))) {
                ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),rere_reportcnt : 'rere_reportcnt',rereboardnumber : rereboardnum}))
            }
        }
};

var singlerereplylikeerase = (rereboardnumber) => {
    return new Promise((ok,no)=>{
        if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),like : 'likenumber',rereboardnumber : rereboardnumber}))){
            ipinstance.getInstance().remove(JSON.stringify({IP : ip.address(),like : 'likenumber',rereboardnumber : rereboardnumber}));
        }
        ok('1');
    })
};

var singlerereplyreporterase = (rereboardnumber) => {
    return new Promise((ok,no)=>{
        if(ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),rere_reportcnt : 'rere_reportcnt',rereboardnumber : rereboardnumber}))) {
            ipinstance.getInstance().get(JSON.stringify({IP : ip.address(),rere_reportcnt : 'rere_reportcnt',rereboardnumber : rereboardnumber}))
        }
        ok('1');
    })
};
router.post('/saveboardyoutube',async (req,res)=> {
    let url = req.body.linkaddress
    var async1 =  ()=>{
        return new Promise((fulfilled,rejected)=>{
            puppeteer.launch({headless: true}).then(async browser => {
                const page = await browser.newPage();
                await page.goto(url);
                try {
                    await page.waitForSelector('h1');
                    await page.waitForSelector('ytd-video-owner-renderer div ytd-channel-name div div yt-formatted-string a');
                    const title = await page.evaluate(()=> document.querySelector('h1').textContent);
                    const who = await page.evaluate(()=>document.querySelector('ytd-video-owner-renderer div ytd-channel-name div div yt-formatted-string a').textContent);
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
        async2().then((linkaddress)=> {
            if(req.body.title !=="") {
                const boardcontentdb = new boardcontent({
                    category: req.body.category, likenumber: 0, dislikenumber: 0, linkaddress: url,
                    videolinkaddress: linkaddress, title: req.body.title, author: req.body.author,
                    password: req.body.password, reportcnt: 0, iframetoggle: false,
                    replytoggle: false, linkauthor: who, linktitle: title
                });
                boardcontentdb.save((err, obj) => {
                    if (err) {
                        console.log(err);
                        throw err
                    }
                    res.json({test: obj})
                })
            } else {
                const boardcontentdb = new boardcontent({
                    category: req.body.category, likenumber: 0, dislikenumber: 0, linkaddress: url,
                    videolinkaddress: linkaddress, title: title, author: req.body.author,
                    password: req.body.password, reportcnt: 0, iframetoggle: false,
                    replytoggle: false, linkauthor: who, linktitle: title
                });
                boardcontentdb.save((err, obj) => {
                    if (err) {
                        console.log(err);
                        throw err
                    }
                    res.json({test: obj})
                })
            }
        })
    }).catch((error)=>{
        console.log(error);
        res.json({err : error})
    })
});


router.post('/saveboardtwitch',async (req,res)=>{
    let url = req.body.linkaddress
    var async1 =  ()=>{
        return new Promise((fulfilled,rejected)=>{
            puppeteer.launch({headless: true}).then(async browser => {
                const page = await browser.newPage();
                await page.goto(url);
                try {
                    await page.waitForSelector('main div div div div div div a div p');
                    await page.waitForSelector('div div p span');
                    const title = await page.evaluate(()=> document.querySelector('div div p span').textContent);
                    const who = await page.evaluate(()=>document.querySelector('main div div div div div div a div p').textContent);
                    // console.log(title);
                    // console.log(who);
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
            if(url.match("clip")){
                const linkaddress = url.substring(url.indexOf('clip')+5,url.size);
                const data = 'https://clips.twitch.tv/embed?clip=' + linkaddress;
                // console.log(data)
                done(data)
            }
            else {
                const linkaddress = url.substring(url.indexOf('video')+7,url.size)
                const data = 'https://www.twitch.tv/videos/embed/' + linkaddress;
                //console.log(data)
                done(data)
            }
        })
    };

    async1().then(({title,who})=> {
        async2().then((linkaddress)=> {
            if(req.body.title !=="") {
                const boardcontentdb = new boardcontent({
                    category: req.body.category, likenumber: 0, dislikenumber: 0, linkaddress: url,
                    videolinkaddress: linkaddress, title: req.body.title, author: req.body.author,
                    password: req.body.password, reportcnt: 0, iframetoggle: false,
                    replytoggle: false, linkauthor: who, linktitle: title
                });
                boardcontentdb.save((err, obj) => {
                    if (err) {
                        console.log(err);
                        throw err
                    }
                    res.json({test: obj})
                })
            } else {
                const boardcontentdb = new boardcontent({
                    category: req.body.category, likenumber: 0, dislikenumber: 0, linkaddress: url,
                    videolinkaddress: linkaddress, title: title, author: req.body.author,
                    password: req.body.password, reportcnt: 0, iframetoggle: false,
                    replytoggle: false, linkauthor: who, linktitle: title
                });
                boardcontentdb.save((err, obj) => {
                    if (err) {
                        console.log(err);
                        throw err
                    }
                    res.json({test: obj})
                })
            }
        })
    }).catch((error)=>{
        console.log(error);
        res.json({err : error})
    })
});

router.post('/savereply',(req,res)=>{
    // boardnumber에 대한 댓글을 다시 가지고온다
    const boardreplydb = new boardreply({boardnumber : req.body.boardnumber, relikenumber: 0, reauthor : req.body.reauthor,
        recontent : req.body.recontent, repassword: req.body.repassword,re_reportcnt: 0});
    boardreplydb.save((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        boardreply.find({reboardnumber : data.reboardnumber}).exec((err,data)=>{
            if(err){
                console.log(err);
                throw err;
            }
            res.json({test: data})
        })
    });
});
router.post('/saverereply',(req,res)=>{
    const boardrereplydb = new boardrereply({boardnumber : req.body.boardnumber, reboardnumber : req.body.boardreplynumber,rerelikenumber: 0,rereauthor: req.body.rereauthor,
        rerecontent : req.body.rerecontent, rerepassword: req.body.rerepassword, rere_reportcnt: 0});
    boardrereplydb.save((err)=>{
        if(err){
            console.log(err);
            throw err
        }
        res.json({test: 'ok'})
    })
});

router.post('/removeboardcontent',async (req,res)=> {
    // ip테이블 관련한 것을 지우기 위해 데이터가 필요함
    // 입력했을때 비밀번호를 받아서 그것이 일치하면 지우고,아니면 못지움
    boardcontent.deleteOne({boardnumber : req.body.boardnumber,password: req.body.password}).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        if(data.deletedCount == 1) {
            var one = likeerase(req.body.boardnumber);
            var two = dislikeerase(req.body.boardnumber);
            var three = reporterase(req.body.boardnumber);
            var a = findreplycontent(req.body.boardnumber).then((data)=> {
                multireplyreporterase(data);
                multireplylikeerase(data);
                return findrereplycontent(data);
            }).then((data)=>{
               multirereplylikeerase(data);
               multirereplyreporterase(data);
            }).catch((err)=>console.log(err));


            Promise.all([one,two,three,a]).then(()=> {
                boardreply.deleteMany({boardnumber : req.body.boardnumber}).exec((err)=>{
                    if(err){
                        console.log(err);
                        throw err
                    }
                    boardrereply.deleteMany({boardnumber : req.body.boardnumber}).exec((err)=>{
                        if(err){
                            console.log(err);
                            throw err
                        }
                        res.json({test:'removeboardcontent ok'});
                    });
                });
            })
        }
        else {
            res.json({test : '비밀번호가 틀렸습니다. 다시 입력해주세요'});
        }
    })
});

router.post('/removeboardreplycontent',async (req,res)=> {

    boardreply.deleteOne({reboardnumber: req.body.reboardnumber, repassword : req.body.repassword}).exec((err,data)=>{
        if(data.deletedCount == 1) {
            var one = singlereplylikerase(req.body.reboardnumber);
            var two = singlereplyreporterase(req.body.reboardnumber);
            var three = singlefindrereply(req.body.reboardnumber).then((data)=>{
               multirereplylikeerase(data);
               multirereplyreporterase(data);
            });
            Promise.all([one,two,three]).then(() => {
                boardrereply.deleteMany({reboardnumber : req.body.reboardnumber}).exec((err,data)=> {
                    if(err) {
                        console.log(err);
                        throw err
                    }
                    res.json({test: '댓글이 성공적으로 지워졌습니다'});
                });
            })
        } else {
            res.json({test :'비밀번호가 틀렸습니다. 다시 입력해주세요'})
        }
    })
});
router.post('/removeboardrereplycontent',async (req,res)=>{
    boardrereply.deleteOne({rereboardnumber : req.body.rereboardnumber, rerepassword: req.body.rerepassword}).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err;
        }
        if(data.deletedCount == 1) {
            var one = singlerereplylikeerase(req.body.rereboardnumber);
            var two = singlerereplyreporterase(req.body.rereboardnumber);
            Promise.all([one,two]).then(()=>{
                res.json({test : '대댓글이 성공적으로 지워졌습니다'});
            });
        } else {
            res.json({test : '비밀번호가 틀렸습니다. 다시 입력해주세요'});
        }
    })
});

module.exports = router;