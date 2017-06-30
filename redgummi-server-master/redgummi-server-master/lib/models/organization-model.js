const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var organizationSchema = new Schema({
  // The unique id for the organization document
  uuid: {type: String, required: [true, 'organization uuid is required']},

  // creation details timestamp and the profile uuid of creator
  created: {
    // the creation timestamp
    timestamp: {type: Date, required: [true, 'creation timestamp is required']},
    // the profile uuid of creator
    by: {type: String, ref: 'Profile'},
  },

  // the journal of modifications. array of timestamp of modification and profile uuid of modifier
  lastModified: [{
    // the timestamp of modification
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    // the profile uuid of modifier
    by: {type: String, ref: 'Profile'},
  },],

  // name of the organization - "Wipro Technologies Pvt Ltd.,"
  name:  {type: String, required: [true, 'organization name is required']},

  // UUID of the user who is considered admin for this organization.
  admin:  {type: String, ref: 'Profile'},

  // Details of the logo of the company
  logo: {
    // file name of the logo that was uploaded. Only filename.ext is stored.
    fileName: {type: String, required: [false]},
    // MIME type of image.
    type: {type: String, required: [false]},
    // contents of the image will be stored in this field.
    file: {type: Buffer, required: [false]},
    // if the logo is stored in a service like amazon S3 then the shareable URI will be stored in this field.
    uri: {type: String, required:[false]}
  },

  // status of the organization - 'active', 'inactive'
  status: {type: String, required: [true, 'organization status is required']},

  // description of the organization that cna be shown in the webpage for that organization
  // Example: "Wipro is a world leading services organization that ...'
  description: {type: String, required: [false]},

  // address of the organization
  address: {
    line1: {type: String, required: [false]},
    line2: {type: String, required: [false]},
    city: {type: String, required: [false]},
    state: {type: String, required: [false]},
    country: {type: String, required: [false]},
    zip: {type: String, required: [false]},
    googleMapsUri: {type: String, required: [false]},
  },

  // internet links
  internet: [{
    // simple name of the URL. Examples: "primary", "home page", "telecom organization home page", ...
    name: {type: String, required: [false]},
    // the actual URL
    url: {type: String, required: [false]}
  }],

  // email details
  email: [{
    // simple name of the email. Examples: "primary", "work", "admin", "VP of HR", ...
    name: {type: String, required: [false]}, // "primary", ...
    // the actual email
    id: {type: String, required: [false]},
  }],

  // phone details
  phone: [{
    // simple name of the phone. Examples: "work", "fax", "mobile", ...
    name: {type: String, required: [false]}, // "primary", ...
    // the actual phone number
    number: {type: String, required: [false]},
  }],

  // social profile details
  socialProfile : [{
    // simple name of the social profile. Examples: "facebook", "linkedin", "google", "wireless org linkedin page", "..."
    name: {type: String, required: [false]}, // 'facebook', 'linkedin', 'google'
    // the actual social profile URI
    url: {type: String, required: [false]},
  }],
});

exports.Organization = mongoose.model('Organization', organizationSchema);
