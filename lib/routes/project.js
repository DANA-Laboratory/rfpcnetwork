var logger = require("../logger")
, S = require('string')
, login = require('../../test/login')
, ProjectService = require('../project')
, Project = new ProjectService();

exports.post = function(req, res){
    logger.info('Post.' + req.body.name);
    if (S(req.body.name).isEmpty())
    return res.status(400).json('Bad Request');
    req.body.user = login.user;
    req.body.token = login.token;
    Project.post(req.body.name, req.body, function(error, project) {
        if (error) return res.json(500, 'Internal Server Error');
        if (project == null) return res.status(409).json('Conflict');
        res.location('/project/' + project._id);
        return res.status(201).json(project);
    });
};

exports.get = function(req, res){
    logger.info('Request.' + req.url);
    if (req.params.id.length !== 24)
    return res.status(400).json('Bad Request');
    Project.get(req.params.id, function(error, project) {
        if (error) return res.status(500).json('Internal Server Error');
        if (project == null) return res.status(404).json('Not Found');
        return res.status(200).json(project);
    });
};

exports.put = function(req, res){
    logger.info('Put.' + req.params.id);
    if (S(req.body.name).isEmpty() || req.params.id.length !== 24)
    return res.status(400).json('Bad Request');
    req.body.user = login.user;
    req.body.token = login.token;
    Project.put(req.params.id, req.body, function(error, project) {
        if (error) return res.status(500).json('Internal Server Error');
        if (project == null) return res.status(404).json('Not Found');
        return res.status(204).json('No Content');
    });
};

exports.del = function(req, res){
    logger.info('Delete.' + req.params.id);
    if (req.params.id.length !== 24)
    return res.status(400).json('Bad Request');
    Project.del(req.params.id, function(error, project) {
        if (error) return res.status(500).json('Internal Server Error');
        if (project == null) return res.status(404).json('Not Found');
        return res.status(204).json('No Content');
    });
};

exports.all = function(req, res){
    logger.info('Request.' + req.url);
    var userId = login.user || req.query.user || req.user.id;
    Project.all(userId, function(error, projects) {
        if (error) return res.status(500).json('Internal Server Error');
        if (projects == null) projects = {};
        return res.status(200).json(projects);
    });
};
