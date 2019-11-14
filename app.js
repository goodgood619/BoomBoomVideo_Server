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

var server = require('./bin/www');

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