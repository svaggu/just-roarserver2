var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminUploadSchema = new Schema({
  uuid: {type: String, required: true},
  timestamp: {type: Date, required: true},
  name: {type: String, required: true},
  fileUrl: {type: String, required: true},
  profile: {type: String, ref: 'Profile'},
  type: {type: String/*, required: [true, 'resume file type is required']*/},
  file: {type: Buffer/*, required: [true, 'resume file contents is required']*/},
  status: {type: String, required: [true, 'resume status is required']}
});

exports.AdminUpload = mongoose.model('AdminUpload', adminUploadSchema);
