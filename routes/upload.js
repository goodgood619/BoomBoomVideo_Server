var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var fs = require('fs');
var multer = require('multer');
var path = require('path');

router.post('/multiparty',(req,res,next)=>{
    var form = new multiparty.Form();

    // get field name & value( 파일이 아닌 다른 필드가 들어왔을때 발생)
    form.on('field',(name,value)=>{
        console.log('field name : '+name+' ,value = '+value);
    });

    // html part가 들어왔는데, 파일 업로드 파트만 따로 잡아서 발생하는 이벤트
    form.on('part',(part)=>{
        var filename;
        var size;
        if(part.filename){
           filename = part.filename;
           size = part.byteCount;
        }
        else {
            part.resume();
        }

        console.log('Write Streaming file : ' + filename);
        // 이 path는 절대경로임! 그래서 /는 root로 맞춰져있음
        var writeStream = fs.createWriteStream('/home/alcuk1/IdeaProjects/testApp/public/images/'+filename);
        writeStream.filename = filename;
        part.pipe(writeStream); //??

        //계속 받는중
        part.on('data',(chunk)=>{
            console.log(filename + 'read' + chunk.length + 'bytes');
        });
        // 끝남
        part.on('end',()=>{
           console.log(filename + 'Part read complete');
           writeStream.end();
        });
    });

    // close(폼 데이터가 모두 upload 되었을때 발생
    form.on('close',()=>{
        res.status(200).send('Upload complete');
    });

    // 중간중간 현재 진행상태(progress)
    form.on('progress',(byteread,byteExpected)=>{
       console.log('Reading total '+ byteread + '/' + byteExpected);
    });

    form.parse(req);
});

// single이면 한개(single 뒤에 붙는건 name key값을 의미함) , 여러개면?
// app.post('/simpleupload',multer({dest:'/home/alcuk1/IdeaProjects/testApp/public/images/'}).single('myfile3'),(req,res)=>{
//   console.log('req.body : '+ JSON.stringify(req.body)); //이미지가 아닌 나머지 데이터
//   console.log('req file : '+ JSON.stringify(req.file));
//   //res.status(204).end();
//   var data = req.body;
//   data.imagepathname = __dirname + '/public/images/' + req.filename;
//  // res.send(express.static(req.file.path)); //이미지 파일 자체를 보내는것
//   res.render('imageshow',{file: 'home/alcuk1/IdeaProjects/testApp/public/images/${req.file.filename}'});
// });

router.post('/multer',(req,res)=> {
    const storage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,'public/images/');
        } ,
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
    }).single('myfile3');

    upload(req,res,(err)=>{
        if(err) {
            res.render('imageshow',{test: err});
        }
        else {
            if(req.file === undefined) {
                res.render('imageshow',{test: 'error: no files selected!'});
            } else {
                res.set({'content-type':'text/html; charset=utf-8'});
                var testpath = req.file.filename;
                var upload = '/images/'+testpath;
                res.render('imageshow',{
                    file : upload,
                    test : 'ok'
                })
            }
        }
    });
});

module.exports = router;

// fields([{name : key1},{name2: key2}, ...])
// app.post('/simpleupload',multerupload.fields([{name:'myfile3'},{name: 'myfile4'}]),(req,res)=>{
//   // console.log('req.body : '+ req.body); //이미지가 아닌 나머지 데이터
//   // console.log('req file : '+ req.file);
//   res.status(204).end();
// });
