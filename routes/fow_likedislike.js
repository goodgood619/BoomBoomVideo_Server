const express = require('express');
const router = express.Router();
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const ipinstance = require('./Singleton');
const Promise = require('es6-promise');
const ip = require('ip');

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
router.post('/likereplycontent', async (req,res) => {
    if(ipinstance.getInstance().has(JSON.stringify({IP : ip.address(),like : 'likenumber',reboardnumber : req.body.reboardnumber}))){
        res.json({test: 'no'});
    }
    else {
        ipinstance.getInstance().put(JSON.stringify({IP: ip.address(), like: 'likenumber',reboardnumber : req.body.reboardnumber}), 1);
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

module.exports = router;