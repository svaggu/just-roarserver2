const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var emailTemplateSchema = new Schema({
  uuid: {type: String, required: [true, 'profile uuid is required']},
  created: {
    timestamp: {type: Date, required: [true, 'creation timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of creator
  },
  lastModified: [{
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  }],
  status: {type: String, required: [true, 'Status is required']}, // active or inactive
  title: {type: String, required: [true, 'Title is required']}, // Search criteria of the jobs
  subject: {type: String, required: [true, 'Subject is required']}, // this may or may not be same as login.username
  text: {type: String, required: [true, 'text is required']}, // this may or may not be same as login.username
  profile: {type: String, ref: 'Profile'}, // Profile UUID of the user who created this alert

});

exports.EmailTemplate  = mongoose.model('emailtemplate', emailTemplateSchema);
