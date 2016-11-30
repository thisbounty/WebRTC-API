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
            'caller':user,
            'token':opentok.generateToken(session.sessionId),
            'session':session.sessionId
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
              call.searcher = user;
              call.save();
              cb(null, call);
          }); // findById
          Call.createChangeStream(function(err, changes) {
              changes.pipe(es.stringify()).pipe(process.stdout);
          });
      }); // req.accessToken.user
  }; // Call.connect

  Call.remoteMethod('connect', {
    http: {path: '/connect', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}},
     {arg: 'id', type: 'number'},
    ],
    returns: {arg:'call',type:'object'}
  }); // Call.remoteMethod

  Call.table= function (req, res, cb) {
      var app = req.app;
      app.currentUser = null;
      if (!req.accessToken) return cb('Authorization Required');
      req.accessToken.user(function(err, user) {
          Call.find({}, function(err, calls){
              console.log(calls)
              if(err) return cb(err);
              for(var i=0; i < calls.length; i++) {
                  //keep user details private, only show first name
                  calls[i].callerId=calls[i].caller.id;
                  calls[i].caller=calls[i].caller.firstName;
              }
              cb(null, calls);
          }); // find
      }); // req.accessToken.user
  }; // Call.table

  Call.remoteMethod('table', {
    http: {path: '/table', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: {arg:'calls',type:'array'}
  }); // Call.remoteMethod

  Call.opentok = function (req, res, secret, cb) {
    if(!req.body.sessionId || req.body.event !== 'ConnectionDestroyed') {
        //no sessionId sent
        cb(true, null);
        return;
    }
    Call.find({"where": {"session": req.body.sessionId}}, function (err,data) {
      if(err) return cb(err);
      data.forEach(function (call) {
        call.disconnect(call);
      });
      cb(false, true);
    });
    //no records found
    cb(true, null);
  };

  Call.remoteMethod('opentok', {
    http: {path: '/opentok', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'secret', type: 'string'}
    ],
    returns: {arg:'opentok',type:'Boolean'}
  }); // Call.remoteMethod

  Call.disconnect = function (call) {
    call.status = 'Disconnected';
    call.save();

    Call.createChangeStream(function(err, changes) {
      changes.pipe(es.stringify()).pipe(process.stdout);
    });
  };

}; // module.exports
