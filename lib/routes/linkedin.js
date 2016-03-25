var logger = require("../logger")
, config = require('../configuration')
, linkedinService = require('../linkedin');

exports.createnew = function(req, res) {
    logger.info('Create new linkedin service.');
    linkedsrv = new linkedinService();
    res.redirect(linkedsrv.url);
};

exports.post = function(req, res) {
    logger.info('Retrieve linkedin service. ' + req.body.state);
    var linksrv = linkedinService.has(req.body.state);
    if (linksrv === false)
        res.status(401).end();
    else
        if (linkedinService.expired(linksrv))
            res.status(408).end();
        else
            res.status(200).json(linksrv);
};

exports.authcallback = function(req, res) {
    logger.info('Auth Callback.', req.query);
    var callback = function(err,httpResponse,body) {
        var jsonbody = JSON.parse(body);
        if(!err && 'expires_in' in jsonbody && 'access_token' in jsonbody) {
            linksrv.settoken(jsonbody.access_token, jsonbody.expires_in);
            res.status(200).end();
        } else {
            console.log(jsonbody);
            res.status(500).end();
        }
    }
    if ('state' in req.query) {
        var linksrv = linkedinService.has(req.query.state);
        if (linksrv === false)
            res.status(401).end();
        else {
            if (linkedinService.expired(linksrv))
                res.status(408).end();
            else {
                linkedsrv.getrequest(req.query.code, callback);
            }
        }
    } else if('error_description' in req.query) {
        res.status(205).json({error_description : req.query.error_description});
    }
};
