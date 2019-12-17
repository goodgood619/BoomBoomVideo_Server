const express = require('express');
const router = express.Router();
const boardcontent = require('../model/boardContent');
const boardreply = require('../model/boardReply');
const boardrereply = require('../model/boardRereply');
const Promise = require('es6-promise');

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
var totalsearchcontent = (searchcategory,searchtitle) => {
  return new Promise((ok,no)=>{
      boardcontent.countDocuments({$and:[{linktitle :{$regex:searchtitle}},{category :{$regex:searchcategory}}]}).exec((err,data)=>{
          if(err){
              console.log(err)
              no(err)
              throw err
          }
          ok(data)
      })
  })
};
// 좋아요 content 갯수 계산
var likecontent = () => {
    return new Promise((ok,no)=>{
        boardcontent.aggregate([
            {$addFields : {votes : {$subtract : ["$likenumber","$dislikenumber"]}}},
            {$sort : {votes : -1,reg_dt :1}}
        ]).skip(0).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data);
        });
    })
};
// search 적용된 것 계산
var search = (page,searchcategory, searchtitle) =>{
  return new Promise((ok,no)=>{
      boardcontent.find({$and:[{linktitle :{$regex:searchtitle}},{category :{$regex:searchcategory}}]}).skip(page*3).limit(3).exec((err,data)=>{
          if(err) {
              console.log(err)
              no(err)
              throw err
          }
          ok(data);
      })
  })
};
// page적용된 등록순서(일찍된순서대로)
var nextcontent = (page) => {
    return new Promise((ok,no)=>{
        boardcontent.find({}).skip(page*3).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data);
        })
    })
};
// page적용된 등록순서(가장 최근순서대로)
var nextcurrentcontent = (page) => {
    return new Promise((ok,no)=>{
        boardcontent.find({}).sort({reg_dt : -1}).skip(page*3).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data);
        })
    })
};
// 좋아요 다음 혹은 뒷 페이지 content 갯수 계산
var nextlikecontent = (page) => {
    return new Promise((ok,no)=>{
        boardcontent.aggregate([
            {$addFields : {votes : {$subtract : ["$likenumber","$dislikenumber"]}}},
            {$sort : {votes : -1,reg_dt: 1}}
        ]).skip(page*3).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data);
        });
    })
};
// 전체페이지 카테고리용(첫페이지 데이터 찾기)
var categorycontent = (category) =>{
    return new Promise((ok,no)=>{
        boardcontent.find({category : category}).skip(0).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data)
        })
    })
};
// 전체페이지 카테고리용(첫페이지 데이터 찾기, 등록순서가 늦은순서대로)
var currentcontent = () =>{
    return new Promise((ok,no)=>{
        boardcontent.find({}).sort({reg_dt : -1}).skip(0).limit(3).exec((err,data)=>{
            if(err){
                console.log(err);
                no(err);
                throw err
            }
            ok(data)
        })
    })
};
var totalcategorycontent = (category) =>{
    return new Promise((fulfilled,rejected)=>{
        boardcontent.countDocuments({category : category}).exec((err,data)=>{
            if(err){
                console.log(err);
                rejected(err);
                throw err
            }
            fulfilled(data);
        })
    })
};
var nextcategorycontent = (category,page) =>{
    return new Promise((ok,no)=>{
        boardcontent.find({category: category}).skip(page * 3).limit(3).exec((err, data) => {
            if (err) {
                console.log(err);
                no(err);
                throw err
            }
            ok(data)
        })
    })
};

// 댓글갯수
var replycontent = (data) => {
    if(data.length == 1) {
        return new Promise((ok, no) => {
            boardreply.find({$or: [{boardnumber: data[0].boardnumber}]}).sort({relikenumber : -1}).exec((err, data) => {
                if (err) {
                    console.log(err);
                    no(err);
                    throw err
                }
                ok(data)
            })
        })
    }
    else if(data.length == 2) {
        return new Promise((ok, no) => {
            boardreply.find({$or: [{boardnumber: data[0].boardnumber}, {boardnumber: data[1].boardnumber}]}).sort({relikenumber : -1}).exec((err, data) => {
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
            boardreply.find({$or: [{boardnumber: data[0].boardnumber}, {boardnumber: data[1].boardnumber}, {boardnumber: data[2].boardnumber}]}).sort({relikenumber : -1}).exec((err, data) => {
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

router.post('/dataupload',async (req,res)=> {
    const page = req.body.page;
    const value1 = [],value2 = [], value3 = [],value4 = [];
    // boardcontent 내용들
    var findboardcontent = () => {
        return new Promise((fulfilled, rejected) => {
            boardcontent.find().skip(page * 3).limit(3).exec((err, data) => {
                if (err) {
                    console.log(err);
                    rejected(err);
                    throw err
                }
                fulfilled(data)
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

router.post('/registerupload',async (req,res)=> {
    const value1 = [],value2 = [], value3 = [],value4 = [];
    var a = nextcontent(0).then((data)=>{
        value1.push({uploaddata: data});
        return replycontent(data)
    }).then((data)=>{
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
router.post('/currentupload',async (req,res)=> {
    const value1 = [],value2 = [], value3 = [],value4 = [];
    var a = currentcontent().then((data)=>{
        value1.push({uploaddata: data});
        return replycontent(data)
    }).then((data)=>{
        value2.push({reply: data})
    }).catch((err)=> console.log(err));

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
router.post(['/humordataupload','/lolupload','/gameupload','/bgroundupload','/owatchupload','/impressupload','/animalupload','/sportsupload','/etcupload',
    '/musicupload'],async (req,res)=>{
    // 최초의 0페이지로 디폴트 + 그에 관한 댓글 + 대댓글
    const n1 = [], n2 = [] ,n3 =[], n4 = [];

    var wa = categorycontent(req.body.category).then((data)=>{
        n1.push({uploaddata : data});
        return replycontent(data)
    }).then((data)=>{
        n2.push({reply : data});
    }).catch((err)=>console.log(err));
    var wb = totalcategorycontent(req.body.category).then((data)=>{
        n3.push({totalboardcnt : data})
    });
    var wc = rereplycontent().then((data)=>{
        n4.push({rereply : data});
    });
    Promise.all([wa,wb,wc]).then(()=>{
        res.json({
            uploaddata : n1,replydata : n2,
            totalboardcontent : n3, rereplydata : n4
        })
    });
});
router.post('/searchcontent',async (req,res)=>{
    const n1 = [], n2 = [], n3 = [], n4 = [];

    var la = search(0,req.body.searchcategory,req.body.searchtitle).then((data)=> {
        n1.push({uploaddata : data});
        return replycontent(data);
    }).then((data)=>{
        n2.push({reply : data});
    }).catch((err)=>console.log(err));
    var lb = totalsearchcontent(req.body.searchcategory,req.body.searchtitle).then((data)=>{
        n3.push({totalboardcnt : data});
    });
    var lc = rereplycontent().then((data)=>{
        n4.push({rereply : data});
    });

    Promise.all([la,lb,lc]).then(()=>{
        res.json({
            uploaddata : n1,replydata : n2,
            totalboardcontent : n3, rereplydata : n4
        })
    })
});
router.post('/likeupload',async (req,res)=>{

    const n1 = [], n2 = [], n3 = [], n4 = [];
    var la = likecontent().then((data)=> {
        n1.push({uploaddata : data});
        return replycontent(data);
    }).then((data)=>{
        n2.push({reply : data});
    }).catch((err)=>console.log(err));
    var lb = totalboardcontent().then((data)=>{
        n3.push({totalboardcnt : data});
    });
    var lc = rereplycontent().then((data)=>{
        n4.push({rereply : data});
    });

    Promise.all([la,lb,lc]).then(()=>{
        res.json({
            uploaddata : n1,replydata : n2,
            totalboardcontent : n3, rereplydata : n4
        })
    })
});
router.post('/nextpagination',(req,res)=>{
    const page = req.body.page;
    //전체페이지 넘기는것!(카테고리가 없는경우, 여기서 댓)
    const n1 = [], n2 = [],n4 =[];
    // 검색용이 남아있을때
    if(req.body.searchtitle !== "") {
        var wa = search(page,req.body.searchcategory,req.body.searchtitle).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });
    } else if(req.body.category === "등록순") {

        var wa = nextcontent(page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });
    } else if(req.body.category === "좋아요") {

        const n1 = [], n2 = [], n4 = [];
        var la = nextlikecontent(page).then((data)=> {
            n1.push({uploaddata : data});
            return replycontent(data);
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var lc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });

        Promise.all([la,lc]).then(()=> {
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        })

    } else if(req.body.category === "최신순") {

        var wa = nextcurrentcontent(page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });
    } else {

        var wa = nextcategorycontent(req.body.category,page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));

        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data})
        });

        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        })
    }
});
router.post('/pastpagination',(req,res)=>{
    const page = req.body.page;
    const n1 = [], n2 = [], n4 =[];
    if(req.body.searchtitle !=="") {
        var wa = search(page,req.body.searchcategory,req.body.searchtitle).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });
    } else if(req.body.category === "등록순") {

        var wa = nextcontent(page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });

    } else if(req.body.category === "좋아요") {
        const n1 = [], n2 = [], n4 = [];
        var la = nextlikecontent(page).then((data)=> {
            n1.push({uploaddata : data});
            return replycontent(data);
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var lc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });

        Promise.all([la,lc]).then(()=> {
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        })
    } else if(req.body.category === "최신순") {

        var wa = nextcurrentcontent(page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));
        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data});
        });
        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        });
    } else {
        var wa = nextcategorycontent(req.body.category,page).then((data)=>{
            n1.push({uploaddata : data});
            return replycontent(data)
        }).then((data)=>{
            n2.push({reply : data});
        }).catch((err)=>console.log(err));

        var wc = rereplycontent().then((data)=>{
            n4.push({rereply : data})
        });

        Promise.all([wa,wc]).then(()=>{
            res.json({
                uploaddata : n1,replydata : n2,
                rereplydata : n4
            })
        })
    }
});
module.exports = router;