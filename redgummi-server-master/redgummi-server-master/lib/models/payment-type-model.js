const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var paymentTypeSchema = new Schema({
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
  name: {type: String, required: [true, 'Name is required']}, // Search criteria of the jobs
  number : {type: String, required: [true, 'Number of posts is required']}
});

exports.PaymentType  = mongoose.model('paymenttype', paymentTypeSchema);
