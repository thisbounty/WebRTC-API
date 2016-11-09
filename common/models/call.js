'use strict';
var OpenTok = require('opentok'),

module.exports = function (Call) {

  Call.new= function (req, res, cb) {
    opentok = new OpenTok(process.env.opentok_key, process.env.opentok_secret);
    opentok.createSession(function(err, session) {
        if (err) {
            cb('Opentok error', null);
        }
      // save the sessionId
      var data = {
        'status':'Incoming',
        'caller_id':app.currentUser.id,
        'token':session.sessionId
      };
      Call.updateOrCreate(data, function (err, list) {
        res.opentok = opentok.generateToken(session.sessionId);
        cb(null, list);
      });
    });
  };

  Call.remoteMethod('new', {
    http: {path: '/new', verb: 'get'},
    accepts: [
     {arg: 'req', type: 'object', 'http': {source: 'req'}},
     {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg:'call',type:'array'}
  });

};
