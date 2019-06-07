const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// https://mongoosejs.com/docs/subdocs.html

let RepliesSchema = new mongoose.Schema({
  text: String,
  reported: {type: Boolean, default: true},
  delete_password: {type: String, required: true},
  created_on: {type: Date, default: Date.now}
});

// Defining schema
let ThreadSchema = new mongoose.Schema({
  board: String,
  text: String,
  delete_password: {type: String, required: true},
  reported: {type: Boolean, default: true},
  created_on: {type: Date, default: Date.now},
  bumped_on: {type: Date, default: Date.now},
  replies: [RepliesSchema]
});

const Thread = mongoose.model('thread', ThreadSchema);
module.exports = Thread;