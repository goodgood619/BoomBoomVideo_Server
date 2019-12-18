const express = require('express');
const router = express.Router();
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const Promise = require('es6-promise');
const puppeteer = require('puppeteer');
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
    boardrereplydb.save((err,data)=>{
        if(err){
            console.log(err)
            throw err
        }
        res.json({test: 'ok'})
    })
});

router.post('/removeboardcontent',async (req,res)=>{
    // 입력했을때 비밀번호를 받아서 그것이 일치하면 지우고,아니면 못지움
    boardcontent.deleteOne({boardnumber : req.body.boardnumber,password: req.body.password}).exec((err,data)=>{
        if(err){
            console.log(err);
            throw err
        }
        if(data.deletedCount == 1) {
            boardreply.deleteMany({boardnumber : req.body.boardnumber}).exec((err,data)=>{
                if(err){
                    console.log(err)
                    throw err
                }
                boardrereply.deleteMany({boardnumber : req.body.boardnumber}).exec((err,data)=>{
                    if(err){
                        console.log(err)
                        throw err
                    }
                });
                res.json({test:'removeboardcontent ok'});
            });
        }
        else {
            res.json({test : '비밀번호가 틀렸습니다. 다시 입력해주세요'});
        }
        console.log(data);
    })
});
router.post('/removeboardreplycontent',async (req,res)=>{
    boardreply.deleteOne({reboardnumber: req.body.reboardnumber, repassword : req.body.repassword}).exec((err,data)=>{
        if(data.deletedCount == 1) {
            boardrereply.deleteMany({reboardnumber : req.body.reboardnumber}).exec((err,data)=> {
                if(err) {
                    console.log(err)
                    throw err
                }
                res.json({test: '댓글이 성공적으로 지워졌습니다'});
            })
        } else {
            res.json({test :'비밀번호가 틀렸습니다. 다시 입력해주세요'})
        }
    })
});
router.post('/removeboardrereplycontent',async (req,res)=>{
    boardrereply.deleteOne({rereboardnumber : req.body.rereboardnumber, rerepassword: req.body.rerepassword}).exec((err,data)=>{
        if(err){
            console.log(err)
            throw err
        }
        if(data.deletedCount == 1){
            res.json({test : '대댓글이 성공적으로 지워졌습니다'});
        } else {
            res.json({test : '비밀번호가 틀렸습니다. 다시 입력해주세요'});
        }
    })
});

module.exports = router;