var mongoose = require('mongoose');
var schema = mongoose.Schema;

var functionalAreaSchema = schema({
  uuid: {type: String, required: true},
  timestamp: {type: Date, required: true},
  name: {type: String, required: true},
  status: {type:String,required: true}
});

exports.FunctionalArea = mongoose.model('FunctionalArea', functionalAreaSchema);
