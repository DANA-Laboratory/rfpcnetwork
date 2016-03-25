var config = require('../configuration')
, async = require("async")
, moment = require('moment')
, _ = require("underscore")
, request = require("request")
, randomstring = require("randomstring")
, states = {}
, linkedin = require('node-linkedin')(
    config.get('linkedin:clientid'), config.get('linkedin:secret'), 'http://localhost:3000/linkedin/auth/callback'
);

function linkedinService() {
    this.state = randomstring.generate();
    states[this.state] = this;
    this.url = 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code'
    + '&client_id=' + config.get('linkedin:clientid')
    + '&redirect_uri=' + config.get('linkedin.redirecturi')
    + '&state=' + this.state;
    this.expiretime = moment().add(1, 'h');
};

linkedinService.prototype.getrequest = function(code, callback) {
    this.code = code;
    var form = {grant_type: 'authorization_code'
        , code: code
        , redirect_uri: 'http://localhost:3000/linkedin/auth/callback'
        , client_id: config.get('linkedin:clientid')
        , client_secret: config.get('linkedin:secret')
    };
    request.post({url:'https://www.linkedin.com/uas/oauth2/accessToken', form: form}, callback);
}

linkedinService.prototype.settoken = function(access_token, expires_in) {
    this.access_token = access_token;
    this.expires_in  = expires_in;
}

linkedinService.has = function(state) {
    return (state in states) ? states[state] : false;
};

linkedinService.expired = function(linkedsrv) {
    linkedsrv.expiretime.isBefore(moment()) ? true : false;
};

linkedinService.del = function(state) {
    delete states[state];
};
module.exports = linkedinService;
