var mongoose = require('mongoose');
var schema = mongoose.Schema;

var roleSchema = schema({
  uuid: {type: String, required: true},
  timestamp: {type: Date, required: true},
  name: {type: String, required: true}
});

exports.Role = mongoose.model('Role', roleSchema);
