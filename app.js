var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var mongoose = require('mongoose');
var app = express();
var uploadRouter = require('./routes/upload');
var multer = require('multer');
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
const storage = multer.diskStorage({
    destination: './public/images/',
  filename: function (req,file,cb) {
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
// function checkFileType(file,cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimeType);
//
//   if(mimetype && extname) {
//     return cb(null,true);
//   } else{
//     cb('error : images only');
//   }
//
// }
const upload = multer({
  storage: storage
  // fileFilter : function (req,file,cb) {
  //     checkFileType(file,cb);
  // }
}).single('myfile3');

app.post('/simpleupload',(req,res)=>{
  upload(req,res,(err)=>{
    if(err) {
      res.render('imageshow',{msg: err});
    }
    else {
        if(req.file === undefined) {
          res.render('imageshow',{msg: 'error: no files selected!'});
        } else {
          res.render('imageshow',{
            msg: 'file uploaded' ,
            file : 'images/'+'${req.file.filename}'
            // test : 'ok'
          })
        }
    }
  });
});
// fields([{name : key1},{name2: key2}, ...])
// app.post('/simpleupload',multerupload.fields([{name:'myfile3'},{name: 'myfile4'}]),(req,res)=>{
//   // console.log('req.body : '+ req.body); //이미지가 아닌 나머지 데이터
//   // console.log('req file : '+ req.file);
//   res.status(204).end();
// });
// simple using jwt -simple()
// var jwt = require('jwt-simple');
// var body = {name : 'googood',id : 'notbad',company:'good'};
// var secret = 'mysecret';
// var token = jwt.encode(body,secret);
// console.log('token :'+token);
// var decoded = jwt.decode(token,secret);
// console.log('decoded:'+JSON.stringify(decoded));

mongoose.connect('mongodb://localhost:27017/test', (err) => {
    if (err) {
        console.log('mongoose connection error :' + err);
        throw err;
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('dkqrnjs2'));
app.use(session({
  key:'sid',
  secret:'secret',
  cookie:{
    maxAge : 1000 * 60 * 60
  },
  resave : false,
  saveUninitialized : true,
  store : new FileStore()
}));
app.use(express.static(path.join(__dirname, 'public')));

// get Mapping
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upload',uploadRouter);

app.post('/',function (req,res) {
  id = req.body.id;
  res.cookie('id',id);
  res.redirect('/');
});

app.get('/:room',(req,res)=>{
  console.log('room name is :'+req.params.room);
  res.render('chattingSample',{room : req.params.room});
});
// var io = require('socket.io')(server);
//
// io.sockets.on('connection',(err,socket) => {
//   if(err) {
//     console.log('connection error'+ err);
//     throw err;
//   }
//   console.log('connected');
//   socket.emit('toclient',{msg:'Welcome!'});
//   socket.on('fromclient',(data)=>{
//     socket.broadcast.emit('toclient',data);
//     socket.emit('toclient',data);
//     console.log('Message from Client :'+ data.msg );
//   });
// });

module.exports.writecookie = function(req,res){
  var name = req.signedCookies.name;
  console.log("name cookie is :" + name);
  res.end();
};

module.exports.readsession = function(req,res){
  console.log('write session = name:' + req.session.name);
  res.end();
};

module.exports.writesession = function(req,res){
  req.session.name = 'goodgood';
  console.log('write session = name:' + req.session.name);
  res.end();
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;