const express = require('express');
const router = express.Router();
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const ipinstance = require('./Singleton');
const Promise = require('es6-promise');
const ip = require('ip');

router.post('/reportcntcontent',async (req,res)=> {
    // 신고가 5회이상들어오면 게시물삭제
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),reportcnt : 'reportcnt',boardnumber :req.body.boardnumber}))) {
        res.json({test : 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), reportcnt: 'reportcnt',boardnumber : req.body.boardnumber}), 1);
        var reportcnt = req.body.reportcnt;
        reportcnt++;
        boardcontent.findOneAndUpdate({boardnumber :req.body.boardnumber},{reportcnt : reportcnt},{new : true}).exec((err,data)=>{
            if(err){
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});
router.post('/reportreplycontent',async (req,res)=>{
    // 신고가 5회이상들어오면 댓글삭제(아직은 잘몰라서 이렇게 처리함 ㅇㅇ)
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),re_reportcnt : 're_reportcnt',reboardnumber :req.body.reboardnumber}))) {
        res.json({test : 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), re_reportcnt: 're_reportcnt',reboardnumber : req.body.reboardnumber}), 1);
        var reportcnt = req.body.re_reportcnt;
        reportcnt++;
        boardreply.findOneAndUpdate({reboardnumber :req.body.reboardnumber},{re_reportcnt : reportcnt},{new : true}).exec((err,data)=>{
            if(err){
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});

router.post('/reportrereplycontent',async (req,res)=>{
    // 신고가 5회이상들어오면 댓글삭제(아직은 잘몰라서 이렇게 처리함 ㅇㅇ)
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),rere_reportcnt : 'rere_reportcnt',rereboardnumber :req.body.rereboardnumber}))) {
        res.json({test : 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), rere_reportcnt: 'rere_reportcnt',rereboardnumber : req.body.rereboardnumber}), 1);
        var reportcnt = req.body.rere_reportcnt;
        reportcnt++;
        boardrereply.findOneAndUpdate({rereboardnumber :req.body.rereboardnumber},{rere_reportcnt : reportcnt},{new : true}).exec((err,data)=>{
            if(err){
                console.log(err);
                throw err
            }
            res.json({test: data});
        })
    }
});

module.exports = router;