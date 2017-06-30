var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var jobSchema = new Schema({
  uuid: {type: String, required: [true, 'job uuid is required']},
  timestamp: {type: Date, required: [true, 'job creation timestamp is required']},
  lastModified: [{
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  },],
  name: {type: String, required: [false]}, // File name of the JD file as uploaded by front-end
  type: {type: String, required: [false]}, // MIME type of JD file as uploaded by front-end
  file: {type: Buffer, required: [false]}, // binary contents of the file, read and stored in DB
  status: {type: String, required: [true, 'job status is required']}, // can be "active", "inactive", "hold", "closed"
  parsedJson: {type: Object, required: [false]}, // This is the JSON of the JD as parsed by RChilli
  updateParsedJson: {type: Object, required: [false]}, // This is the JSON of the JD as parsed by RChilli
  profile: {type: String, ref: 'Profile'}, // Profile UUID of the recruiter who posted this JD
  organization: {type: String, ref: 'Organization'}
});

exports.Job  = mongoose.model('Job', jobSchema);
