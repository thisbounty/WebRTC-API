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
      if (!req.accessToken) return cb(null, {});
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
      });
    });
    });
  };

  Call.remoteMethod('new', {
    http: {path: '/new', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg:'call',type:'object'}
  });

};
