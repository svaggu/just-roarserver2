var mongoose = require('mongoose');
var schema   = mongoose.Schema;

// This schema stores the information about which user applied for which job.
var coverLetterSchema = schema({
  uuid: {type: String, required: [true, 'uuid is required']},
  created: {
    timestamp: {type: Date, required: [true, 'creation timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of creator
  },
  lastModified: {
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  },
  title: {type: String, required: [true, 'Title is required']},
  description: {type: String, required: [true, 'Description is required']},
  status: {type: String, required: [true, 'status is required']},
  profile: {type: String, ref: 'Profile'},
  // resume: {type: String, ref: 'Resume'}
});

exports.CoverLetter  = mongoose.model('CoverLetter', coverLetterSchema);
