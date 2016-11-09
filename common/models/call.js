'use strict';
var OpenTok = require('opentok'),
    opentok = new OpenTok(process.env.opentok_key, process.env.opentok_secret);

module.exports = function (Call) {

  Call.new= function () {
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
