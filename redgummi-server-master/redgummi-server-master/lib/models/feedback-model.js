var mongoose = require('mongoose');
var schema = mongoose.Schema;

var feedbackSchema = schema({
  uuid: {type: String, required: [true, 'feedback uuid is required']},
  timestamp: {type: Date, required: [true, 'feedback creation timestamp is required']},
  thinkingtocommentfor : {type: Number,required:[true,'Employee is Commenting for is required']},
  relationship : {type: Number, required:[true,'relationship is required']},
  name : {type: String, required:[true,'name is required']},
  emailid: {type: String, required:[true,'emailid is required']},
  subject: {type: String, required:[true,'subject is required']},
  comment: {type: String, required:[true,'Comments are required']}
});

exports.Feedback = mongoose.model('Feedback', feedbackSchema);
