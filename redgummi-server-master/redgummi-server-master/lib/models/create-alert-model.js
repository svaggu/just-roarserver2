const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var createAlertSchema = new Schema({
  uuid: {type: String, required: [true, 'profile uuid is required']},
  created: {
    timestamp: {type: Date, required: [true, 'creation timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of creator
  },
  lastModified: [{
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  }],
  status: {type: String, required: [true, 'status is required']}, // active or inactive
  title: {type: String, required: [true, 'Title is required']}, // Search criteria of the jobs
  email: {type: String, required: [true, 'email is required']}, // this may or may not be same as login.username
  profile: {type: String, ref: 'Profile'}, // Profile UUID of the user who created this alert

});

exports.CreateAlert  = mongoose.model('createalert', createAlertSchema);
