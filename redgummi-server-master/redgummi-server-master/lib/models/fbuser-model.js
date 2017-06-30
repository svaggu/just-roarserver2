var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  uuid: {type: String, required: [true, 'user uuid is required']},
  timestamp: {type: Date, required: [true, 'user creation timestamp is required']},
  username: {type: String, required: [true, 'username is required']},
  password: {type: String, required: [true, 'username is required']}, // TODO: BCrypt hash that is stored here.
  // status - 'new user' (no email activation done),
  //          'registered' (email activation completed),
  //          'activated' (linked to a client profile),
  //          'deleted' (username marked as deleted)
  phonenumber: {type: String, required: [true, 'phonenumber is required']},
  status: {type: String, required: [true, 'user\'s current status is required']},
  role: {type: String, ref: 'Role'}
});

exports.User = mongoose.model('User', userSchema);
