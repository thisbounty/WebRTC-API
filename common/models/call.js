'use strict';

module.exports = function (Post) {

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
