var app = require('../app')
, request = require('supertest')
, assert = require('assert')
, _ = require('underscore');

describe('Rahavaran network linkedin service', function(){
    var linksrv = {};

    describe('when requesting authentication /linkedin/auth', function(){
        it('should respond with 302', function(done){
            request(app)
            .get('/linkedin/auth')
            .expect(302)
            .end(function (err, res) {
                linksrv = require('querystring').parse(res.header['location']);
                assert(_.has(linksrv, 'redirect_uri'));
                assert(_.has(linksrv, 'client_id'));
                assert(_.has(linksrv, 'state'));
                done();
            });
        });
    });

    describe('when requesting a valid linkedin service /linkedin/auth', function(){
        it('should respond with 200', function(done){
            request(app)
            .post('/linkedin/auth')
            .send({state: linksrv.state})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                linksrv = JSON.parse(res.text);
                assert(_.has(linksrv, 'url'));
                assert(_.has(linksrv, 'state'));
                assert(_.has(linksrv, 'expiretime'));
                done();
            });
        });
    });

    describe('when requesting an invalid linkedin service /linkedin/auth', function(){
        it('should respond with 401', function(done){
            request(app)
            .post('/linkedin/auth')
            .send({state: '.'})
            .expect(401, done);
        });
    });

    describe('when valid linkedin service recives invalid code /linkedin/auth/callback', function(){
        it('should respond with 500', function(done){
            request(app)
            .get('/linkedin/auth/callback?state=' + linksrv.state + '&code=testcode')
            .expect(500, done)
        });
    });

    describe('when valid linkedin service recives valid code /linkedin/auth/callback', function(){
        it('should respond with 200', function(done){
            request(app)
            .get('/linkedin/auth/callback?state=' + linksrv.state + '&code=AQSkRWev1sjELZvlvVzM0UHXopgThfWSj-1G7DFvNLmgplDvirlyVa3Hy4Bugr6FmUsJfoKYdrAjgIVeQQVPyv5w6Y6RXQss9_T30omgase6v7eCxlw')
            .expect(200, done)
        });
    });

    describe('when invalid linkedin service recives code /linkedin/auth/callback', function(){
        it('should respond with 401', function(done){
            request(app)
            .get('/linkedin/auth/callback?state=.&code=testcode')
            .expect(401, done)
        });
    });

    describe('when invalid linkedin call with an error /linkedin/auth/callback', function(){
        it('should respond with 205', function(done){
            request(app)
            .get('/linkedin/auth/callback?error=1&error_description=user cancel')
            .expect('Content-Type', /json/)
            .expect(205, done)
        });
    });
});
