'use strict';

var OpenTok = require('opentok'),
opentok = new OpenTok(process.env.opentok_key, process.env.opentok_secret);

module.exports = function (Call) {

  Call.new= function (req, res, cb) {
    opentok.createSession(function(err, session) {
        if (err) {
            cb(err);
        }
      // save the sessionId
      var app = req.app;
      app.currentUser = null;
      if (!req.accessToken) return cb('Authorization Required');
      req.accessToken.user(function(err, user) {
          var data = {
            'status':'Incoming',
            'caller':1,
            'token':opentok.generateToken(session.sessionId)
          };
          Call.updateOrCreate(data, function (err, data) {
            if(err) {
                cb(err);
            } else {
                cb(null, data);
            }
          }); // Call.updateOrCreate
        }); // req.accessToken.user
    }); //opentok.createSession
  }; // Call.new

  Call.remoteMethod('new', {
    http: {path: '/new', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg:'call',type:'object'}
  }); // Call.remoteMethod

  Call.connect= function (req, res, cb) {
      var app = req.app;
      app.currentUser = null;
      if (!req.accessToken) return cb('Authorization Required');
      req.accessToken.user(function(err, user) {
      }); // req.accessToken.user
  }; // Call.new

  Call.remoteMethod('connect', {
    http: {path: '/connect', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg:'call',type:'object'}
  }); // Call.remoteMethod

}; // module.exports
