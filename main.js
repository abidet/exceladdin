'use strict';
var express = require('express');
var logger = require('connect-logger');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var AuthenticationContext = require('adal-node').AuthenticationContext;
//var adalHelper =  require('./adalHelper.js');
var adalHelperNew =  require('./test-sample.js');
var spHelper = require('./sharepointHelper.js');
var bodyParser = require('body-parser');

var app = express();
app.use(logger());
app.use(cookieParser('a deep secret'));
app.use(session({secret: '1234567890QWERTY'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/report', function(req, res) {
    spHelper.getListItems(req, res); 
   
});

app.post('/export', function(req, res) {
  spHelper.init(req);
  //adalHelper.processAuth(req, res);
  adalHelperNew.login(req,res,function(){ 
    console.log("authed"); 
  }); 

 
});

app.get('/getAToken', function (req, res) {
  if (req.cookies.authstate !== req.query.state) {
    res.send('error: state does not match');
  }
  adalHelperNew.getAToken(req,res,function(){ 
    res.redirect('report');
});
});

app.listen(3000);
console.log('listening on 3000');
