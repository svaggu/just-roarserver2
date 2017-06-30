var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialprofileSchema = new Schema({
  uuid: {type: String, required: [true, 'user uuid is required']},
  timestamp: {type: Date, required: [true, 'user creation timestamp is required']},
  socialnetwork: {type: String, required: [true, 'Social Network is required']},
  socialnetworkemail: {type: String, required: [true, 'Social Network Email is required']}, // TODO: BCrypt hash that is stored here.
  detailsinjson: {type: Object, required: [true, 'Details From Json format is required']},
  user: {type: String, ref: 'User'}
});

exports.SocialProfile = mongoose.model('SocialProfile', socialprofileSchema);
