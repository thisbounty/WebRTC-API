'use strict';

var OpenTok = require('opentok'),
opentok = new OpenTok(process.env.opentok_key, process.env.opentok_secret);
var es = require('event-stream');

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

  Call.connect= function (req, res, id, cb) {
      var app = req.app;
      app.currentUser = null;
      if (!req.accessToken) return cb('Authorization Required');
      req.accessToken.user(function(err, user) {
          Call.findById(req.param('id'), function(err, call){
              if(err) return cb(err);
              call.status='Connected';
              call.save();
              cb(null, call);
          }); // findById
          Call.createChangeStream(function(err, changes) {
              changes.pipe(es.stringify()).pipe(process.stdout);
          });
      }); // req.accessToken.user
  }; // Call.new

  Call.remoteMethod('connect', {
    http: {path: '/connect', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}},
     {arg: 'id', type: 'number'},
    ],
    returns: {arg:'call',type:'object'}
  }); // Call.remoteMethod

}; // module.exports
