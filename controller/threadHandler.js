const express = require("express");
var MongoClient = require('mongodb');
const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const ThreadModel = require('../models/ThreadModel.js');

// Connect to the database
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});
// mongoose.set('useFindAndModify', false);

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes

// I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
// I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.
exports.getThread = (req, res) => {
  let board = req.params.board;
  let thread_id = req.query.text;

  if(thread_id == null || thread_id == undefined) {
    ThreadModel.find({board: board}, {"replies.delete_password": 0, "replies.reported": 0})
      .limit(10)
      .select('-reported -delete_password')
      .sort({bumped_on: -1})
      .slice('replies', 3)
      .exec((error, records) => res.json(records))
  } else {
    ThreadModel.find({text: thread_id}, {"replies.delete_password": 0, "replies.reported": 0})
      .select('-reported -delete_password')
      .exec((error, records) => res.json(records))
  }
};

// I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
exports.postThread = (req, res) => {
  let board = req.params.board;
  let redirect = '/b/' + board;
  let thread = new ThreadModel({
    board: board,
    text: req.body.text,
    delete_password: req.body.delete_password,
    reported: false,
    created_on: new Date(),
    bumped_on: new Date(),
    replies: []
  })
  thread.save()
  .then(newThread => {
    res.redirect(301, redirect)
  })
  .catch(err => {
    res.send('Missing required fields');
  })
};

// I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
exports.putThread = (req, res) => {
  let board = req.params.board;
  let thread_id = req.body.thread_id;
  ThreadModel.findByIdAndUpdate({_id: thread_id}, {reported: true}, (err, thread) => {
    if(err) {
      res.send('error occurred');
    }
    res.send('success');
  });
};

// I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
exports.deleteThread = (req, res) => {
  let thread_id = req.body.thread_id;
  let password = req.body.delete_password;
  
  ThreadModel.findByIdAndDelete({_id: thread_id, delete_password: password}, (err, thread) => {
    if(err) {
      res.send('incorrect password');
    }
    res.send('success');
  });
};