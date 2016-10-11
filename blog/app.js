var express = require('express'); //生成express实例app
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); //morgan插件的路径地址
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var settings = require('./settings');
var flash = require("connect-flash"); //错误信息提示
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); //设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录。
app.set('view engine', 'ejs'); //设置视图模板引擎为ejs
//加载false插件，关于错误提示信息的，false是一个在session中的用于存储信息的特定区域写了flash
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev')); //加载日志中间件
app.use(bodyParser.json()); //加载解析中间件
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {
    maxAge: 1000 * 60 * 04 * 24 * 30
  },
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));
//session会话，使用 express-session 和 connect-mongo 模块实现了将会化信息存储到mongoldb中。secret 用来防止篡改 cookie，key 的值为 cookie 的名字，通过设置 cookie 的 maxAge 值设定 cookie 的生存期，这里我们设置 cookie 的生存期为 30 天，设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失。在后面的小节中，我们可以通过 req.session 获取当前用户的会话对象，获取用户的相关信息。
//store数据存储,new了一个MongoStore的存储空间，各个配置属性，都是设置的
app.use(flash());
//flash是session会话当中的一部分，负责存储错误正确信息，时缓存
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
