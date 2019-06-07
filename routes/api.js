/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const express = require("express");
const mongoose = require('mongoose');
const expect = require('chai').expect;
const threadHandler = require('../controller/threadHandler.js');
const replyHandler = require('../controller/replyHandler.js');

module.exports = function (app) {
  
  // https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
  app.route('/api/threads/:board')
    .get(threadHandler.getThread)
    .post(threadHandler.postThread)
    .put(threadHandler.putThread)
    .delete(threadHandler.deleteThread);
    
  app.route('/api/replies/:board')
    .get(replyHandler.getReply)
    .post(replyHandler.postReply)
    .put(replyHandler.putReply)
    .delete(replyHandler.deleteReply);
};