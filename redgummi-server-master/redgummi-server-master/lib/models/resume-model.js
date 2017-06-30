var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var resumeSchema = new Schema({
  uuid: {type: String, required: [true, 'resume uuid is required']},
  timestamp: {type: Date, required: [true, 'creation timestamp is required']},
  name: {type: String/*, required: [true, 'resume file name is required']*/},
  type: {type: String/*, required: [true, 'resume file type is required']*/},
  file: {type: Buffer/*, required: [true, 'resume file contents is required']*/},
  status: {type: String, required: [true, 'resume status is required']}, // can be "active", "inactive"
  parsedJson: {type: Object, required: [true, 'parsed resume content cannot be null']},
  updateParsedJson: {type: Object, required: [false]},
  profile: {type: String, ref: 'Profile'}
});

exports.Resume  = mongoose.model('Resume', resumeSchema);
