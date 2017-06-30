var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videoSchema = new Schema({
  uuid: {type: String, required: true},
  timestamp: {type: Date, required: true},
  resumeTitle: {type: String, required: true},
  videoUrl: {type: String, required: true},
  profile: {type: String, ref: 'Profile'}
});

exports.Video = mongoose.model('Video', videoSchema);
