var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    salt: String,
    hash: String,
    isAdmin: Boolean,
    updated: { type: Date, default: Date.now},
  },
  // remove "__v" field
  { versionKey: false });
//export our module to use in server.js
module.exports = mongoose.model('user', usersSchema);
