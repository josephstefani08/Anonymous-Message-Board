const express = require("express");
const MongoClient = require('mongodb');
const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const ThreadModel = require('../models/ThreadModel.js');

// Connect to the database
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes

exports.getReply = (req, res) => {
  let board = req.params.board;
  let threadId = req.query.thread_id;
  
  ThreadModel.find({_id: threadId}, {"replies.delete_password": 0, "replies.reported": 0})
    .select('-reported -delete_password')
    .exec((err, docs) => {
    if(err) {
      res.send(err)
    }
    res.json(docs);
  });
};

// I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.
// (Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
exports.postReply = (req, res) => {
  let board = req.params.board;
  let thread_id = req.body.thread_id;
  let replyText = req.body.text;
  let replyPassword = req.body.delete_password;
  let redirect = '/b/' + board + thread_id;
  
  let reply = {
    text: replyText,
    reported: false,
    delete_password: replyPassword,
    created_on: new Date()
  }
  // Find the thread and add the reply to the replies array
  ThreadModel.findOneAndUpdate({_id: thread_id}, {$push: {replies: reply}}, (err, doc) => {
    if(err) {
      res.send('error occurred')
    }
  });
  ThreadModel.findOneAndUpdate({_id: thread_id}, {$set: {bumped_on: new Date()}}, (err, doc) => {
    if(err) {
      res.send('error occurred')
    }
  });
  res.redirect(301, redirect);
};

// I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')
exports.putReply = (req, res) => {
  let thread_id = req.body.thread_id;
  let reply_id = req.body.reply_id;
  
  ThreadModel.findOneAndUpdate({_id: thread_id, "replies._id": reply_id}, {$set: {"replies.$.reported": true}}, (err, thread) => {
    if(err) {
      res.send('error occurred');
    }
    res.send('success');
  });
};

// I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password.
// (Text response will be 'incorrect password' or 'success')
exports.deleteReply = (req, res) => {
  let board = req.params.board;
  let thread_id = req.body.thread_id;
  let reply_id = req.body.reply_id;
  let password = req.body.delete_password;
  
  // https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/
  ThreadModel.findOneAndUpdate({_id: thread_id}, {$set: {"replies.$[element].text": "[deleted]"}}, {arrayFilters: [{"element._id": new mongoose.Types.ObjectId(reply_id), "element.delete_password": password}], new: true})
    .exec((err, doc) => {
    if(err) {
      res.send('error occurred')
    }
    res.send('success');
    // doc.replies.forEach(i => {
    //   if(i._id == reply_id) {
    //     if(i.text == '[deleted]') {
          // res.send('success');
    //       return;
    //     }
    //     res.send('incorrect password');
    //     return;
    //   }
    // })
  })
};