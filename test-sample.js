
'use strict';

var express = require('express');
var logger = require('connect-logger');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var fs = require('fs');
var crypto = require('crypto');
var AuthenticationContext = require('adal-node').AuthenticationContext;

var parametersFile = './parameters.json';
var sampleParameters;
if (parametersFile) {
  var jsonFile = fs.readFileSync(parametersFile);
  if (jsonFile) {
    sampleParameters = JSON.parse(jsonFile);
  } else {
    console.log('File not found, falling back to defaults: ' + parametersFile);
  }
}

var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
var redirectUri = 'http://localhost:3000/getAToken';
//var resource = '00000002-0000-0000-c000-000000000000';
var resource = sampleParameters.resource;
var templateAuthzUrl = 'https://login.windows.net/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';

exports.login = function (req) {
  console.log(req.cookies);
  res.cookie('acookie', 'this is a cookie');
  res.send('<head>\<title>test</title>\</head>\<body>\  <a href="./auth">Login</a>\</body>');

}

function createAuthorizationUrl(state) {
  var authorizationUrl = templateAuthzUrl.replace('<client_id>', sampleParameters.clientId);
  authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
  authorizationUrl = authorizationUrl.replace('<state>', state);
  authorizationUrl = authorizationUrl.replace('<resource>', resource);
  return authorizationUrl;

}

exports.login =  function(req, res) {
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    res.cookie('authstate', token);
    var authorizationUrl = createAuthorizationUrl(token);
    res.redirect(authorizationUrl);

  });

}
var accessToken="";
exports.getAToken= function(req, res) {
 

  var authenticationContext = new AuthenticationContext(authorityUrl);
  authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, sampleParameters.clientId, sampleParameters.clientSecret, function(err, response) {
    var message = '';
    if (err) {
      message = 'error: ' + err.message + '\n';
    }
    accessToken=response.accessToken;
    
    if (err) {
      res.send(message);
      return;

    }

    authenticationContext.acquireTokenWithRefreshToken(response.refreshToken, sampleParameters.clientId, sampleParameters.clientSecret, resource, function(refreshErr, refreshResponse) {
      if (refreshErr) {
        message += 'refreshError: ' + refreshErr.message + '\n';
      }

      message += 'refreshResponse: ' + JSON.stringify(refreshResponse);
     

    }); 
    res.redirect('report');
  });

};

exports.getAccessToken= function(req, res) {return accessToken;}
