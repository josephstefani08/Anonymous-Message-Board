3/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // A few variables to hold data for tests
  let test1 = {thread_id: "", text: 'Tester1', delete_password: 'pass', reply_id: '', reply_text: 'This is a reply', reply_password: 'pass'};
  let test2 = {thread_id: "", text: 'Tester2', delete_password: 'pass', reply_id: '', reply_text: 'This is a reply', reply_password: 'pass'};

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create a new thread', function(done) {
      chai.request(server)
        .post('/api/threads/theTest')
        .send({text: test1.text, delete_password: test1.delete_password})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get the threads', function(done) {
        chai.request(server)
          .get('/api/threads/theTest')
          .query({})
          .end(function(err, res){
          // Assign test1 and test2 object thread_ids here
          test1.thread_id = res.body[0]._id;
          test2.thread_id = res.body[1]._id;
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'board');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replies');
          done();
        });
      })
    });
    
    suite('DELETE', function() {
      test('delete thread using correct password', function(done) {
        chai.request(server)
        .delete('/api/threads/theTest')
        .send({thread_id: test2.thread_id, delete_password: test2.delete_password})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });      
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
      chai.request(server)
        .put('/api/threads/theTest')
        .send({thread_id: test1.thread_id})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    suite('POST', function() {
           
      test('create a new reply', function(done) {
      chai.request(server)
        .post('/api/replies/theTest')
        .send({_id: test1.thread_id, text: 'Reply1', delete_password: 'replypwd'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get replies', function(done) {
      chai.request(server)
        .get('/api/replies/theTest')
        .send({_id: test1.thread_id})
        .end(function(err, res){
          test1.reply_id = res.body.replies;
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('report reply', function(done) {
      chai.request(server)
        .put('/api/replies/theTest')
        .send({thread_id: test1.thread_id, reply_id: test1.reply_id})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
  
    suite('DELETE', function() {
      test('delete a reply', function(done) {
        chai.request(server)
        .delete('/api/replies/theTest')
        .send({_id: test1.thread_id, reply_id: test1.reply_id, delete_password: 'replypwd'})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        })
      });
    });
  });
});