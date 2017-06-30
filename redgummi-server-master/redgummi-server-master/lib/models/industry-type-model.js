var mongoose = require('mongoose');
var schema = mongoose.Schema;

var industryTypeSchema = schema({
  uuid: {type: String, required: true},
  timestamp: {type: Date, required: true},
  name: {type: String, required: true},
  status: {type:String,required: true}
});

exports.IndustryType = mongoose.model('IndustryType', industryTypeSchema);
