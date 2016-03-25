var app = require('../app')
, request = require('supertest')
, assert = require('assert')
, mongoose = require('mongoose')
, _ = require('underscore')
, login = require('./login');

var recproj = {
    name: "test name",
    user: login.user,
    token: login.token,
    linkes: ["node-plates"]
};

describe('rahavaran network project api', function() {
    var id;

    beforeEach(function(done) {
        mongoose.connection.collections['projects'].drop(function(err) {

            mongoose.connection.collections['projects'].insert(recproj, function(err, docs) {
                id = docs.ops[0]._id;
                done();
            });
        });
    });

    describe('when creating a new resource with invalid request /project', function(){
      var project = {
          name: ""
        , user: ""
        , token: ""
        , linkes    : [ "12345", "9898" ]
      };

      it('should respond with 400', function(done){
         request(app)
          .post('/project')
          .send(project)
          .expect('Content-Type', /json/)
          .expect(400, done);
      });
    });

    describe('when attempting to re-create an existing resource /project', function(){
      it('should respond with 409', function(done){
         request(app)
          .post('/project')
          .send(recproj)
          .expect('Content-Type', /json/)
          .expect(409, done);
      });
    });

    describe('when creating a new resource /project', function(){
        var newproj = {
            name: "new project"
            , user: login.user
            , token: login.token
            , linkes : [ "12345", "9898" ]
        };
        it('should respond with 201', function(done){
            request(app)
            .post('/project')
            .send(newproj)
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function (err, res) {
                var proj = JSON.parse(res.text);
                assert.equal(proj.name, newproj.name);
                assert.equal(proj.user, login.user);
                assert.equal(proj.token, login.token);
                assert.equal(proj.linkes[0], newproj.linkes[0]);
                assert.equal(proj.linkes[1], newproj.linkes[1]);
                assert.equal(res.header['location'], '/project/' + proj._id);
                done();
            });
        });
    });

    describe('when requesting an available resource /project/:id', function(){
        it('should respond with 200', function(done){
            request(app)
            .get('/project/' + id)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var proj = JSON.parse(res.text);
                assert.equal(proj._id, id);
                assert(_.has(proj, '_id'));
                assert(_.has(proj, 'name'));
                assert(_.has(proj, 'user'));
                assert(_.has(proj, 'token'));
                assert(_.has(proj, 'created'));
                assert(_.has(proj, 'linkes'));
                done();
            });
        });
    });

    describe('when requesting a missing resource /project/1', function(){
      it('should respond with 404', function(done){
        request(app)
          .get('/project/41224d776a326fb40f000001')
          .expect('Content-Type', /json/)
          .expect(404, done);
      });
    });

    describe('when requesting a resource with invalid request /project/.', function(){
      it('should respond with 400', function(done){
        request(app)
          .get('/project/.')
          .expect('Content-Type', /json/)
          .expect(400, done);
      });
    });

    describe('when updating an existing resource /project/:id', function(){
        var project = {
            name: "new test name"
            , user: login.user
            , token: login.token
            , linkes : [ "12345", "9898" ]
        };
        it('should respond with 204', function(done){
            request(app)
            .put('/project/' + id)
            .send(project)
            .expect(204, done);
        });
    });

    describe('when updating a resource with invalid request /project/.', function(){
        var project = {
            name: ""
            , user: login.user
            , token: login.token
            , linkes    : [ { gitHubId: "12345" }, { gitHubId: "9898" } ]
        };

        it('should respond with 400', function(done){
            request(app)
            .put('/project/.')
            .send(project)
            .expect(400, done);
        });
    });

    describe('when attempting to update a missing resource /project/:id', function(){
        var project = {
            name: "new test name"
            , user: login.user
            , token: login.token
            , linkes    : [ "12345", "9898" ]
        };

        it('should respond with 404', function(done){
            request(app)
            .put('/project/41224d776a326fb40f000001')
            .send(project)
            .expect('Content-Type', /json/)
            .expect(404, done);
        });
    });

    describe('when deleting an existing resource /project/:id',
    function(){
        it('should respond with 204', function(done){
            request(app)
            .del('/project/' + id)
            .expect(204, done);
        });
    });

    describe('when deleting a resource with invalid request /project/.', function(){
        it('should respond with 400', function(done){
            request(app)
            .del('/project/.')
            .expect(400, done);
        });
    });

    describe('when attempting to delete amissing resource /project/:id', function(){
        it('should respond with 404', function(done){
            request(app)
            .delete('/project/41224d776a326fb40f000001')
            .expect('Content-Type', /json/)
            .expect(404, done);
        });
    });

    describe('when requesting resource get all projects', function(){
        it('should respond with 200', function(done){
            request(app)
            .get('/project/?user=' + login.user)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var proj = _.first(JSON.parse(res.text))
                assert(_.has(proj, '_id'));
                assert(_.has(proj, 'name'));
                assert(_.has(proj, 'user'));
                assert(_.has(proj, 'token'));
                assert(_.has(proj, 'created'));
                assert(_.has(proj, 'linkes'));
                done();
            });
        });
    });
});
