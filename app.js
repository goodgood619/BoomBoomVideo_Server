var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload');
var asyncRouter = require('./routes/async_practice');
var promiseRouter = require('./routes/promise_practice');
var fowRouter = require('./routes/fow');
var fowreportrouter = require('./routes/fow_report');
var fowlikedislikerouter = require('./routes/fow_likedislike');
var fowdataupload = require('./routes/fow_dataupload');
var fowsaveremove = require('./routes/fow_saveremove');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var mongoose = require('mongoose');
var heapdump = require('heapdump');
// var redis = require('redis');
var JSON = require('JSON');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var memoryLeak = [];
function LeakedObject(){}
// client = redis.createClient(6379,'127.0.0.1');
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

// setup bodyparser 및 express 등등, 무조건 이 아래에다가 app.use() 및, app.get, app.post()등을 서술하자
// 왜냐하면, 이건 내생각인데, encoding하기 전에 읽어버려서 값이 깨지는거같다
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('dkqrnjs2'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.json());

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
app.use('/async_practice',asyncRouter);
app.use('/promise',promiseRouter);
app.use('/api',fowRouter);
app.use('/api',fowreportrouter);
app.use('/api',fowlikedislikerouter);
app.use('/api',fowdataupload);
app.use('/api',fowsaveremove);
app.use(cors());
app.options('*',cors());
app.post('/',function (req,res) {
  id = req.body.id;
  res.cookie('id',id);
  res.redirect('/');
});



app.use((req,res,next)=> {
    req.cache = client;
    next();
});
app.post('/profile',(req,res,next)=>{
    req.accepts('application/json');
    console.log(req.body.name);
    var key = req.body.name;
    var value = JSON.stringify(req.body);

    req.cache.set(key,value,(err,data)=>{
        if(err) {
            console.log(err);
            res.send("error "+ err);
            throw err;
        }
        req.cache.expire(key,20);
        res.json(value);
    });
});

app.get('/profile/:name',(req,res,next)=>{
    var key = req.params.name;

    req.cache.get(key,(err,data)=>{
        if(err) {
            console.log(err);
            res.send("error "+ err);
            throw err;
        }
        var value = JSON.parse(data);
        res.json(value);
    });
});
// app.use('/leak',(req,res,next)=>{
//     for(var i = 0;i<1000;i++){
//         memoryLeak.push(new LeakedObject());
//     }
//     // 여기서 process.memoryUsage().rss는 MB -> KB -> Byte임을 알수있다
//     res.send('making memory leak. Current memory usage : ' + (process.memoryUsage().rss/1024/1024) + 'MB');
// });
// app.use('/heapdump',(req,res,next)=>{
//     var filename = 'home/alcuk1/IdeaProjects/testApp/public/images/' + Date.now() + '.heapsnapshot';
//     heapdump.writeSnapshot(filename);
//     res.send('Heapdump has benn generated in '+ filename);
// });
app.get('/:room',(req,res)=>{
  console.log('room name is :'+req.params.room);
  res.render('chattingSample',{room : req.params.room});
});

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