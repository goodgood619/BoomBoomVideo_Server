var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var fs = require('fs');

router.post('/',(req,res,next)=>{
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

module.exports = router;