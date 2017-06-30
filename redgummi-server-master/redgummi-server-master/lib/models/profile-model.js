const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var profileSchema = new Schema({
  uuid: {type: String, required: [true, 'profile uuid is required']},
  created: {
    timestamp: {type: Date, required: [true, 'creation timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of creator
  },
  lastModified: [{
    timestamp: {type: Date, required: [true, 'modified timestamp is required']}, // timestamp
    by: {type: String, ref: 'Profile'}, // profile uuid of modifier
  },],
  // 'new user', 'registered', 'activated', 'deleted'
  status: {type: String, required: [true, 'profile status is required']},
  role: {type: String, ref: 'Role'}, // UUID of the role of this user
  login: {
    username: {type: String, required: [true, 'username (email) is required']}, // email is login username
    password: {type: String, required: [false]}, // TODO: BCrypt hash to be stored here.
                                                 // Also, password is not mandatory validatioen by design
                                                 // if user is logging in using Facebook, Google, for example
  },
  firstName: {type: String, required: [false]}, // Not mandatory for registration
  middleName: {type: String, required: [false]},
  lastName: {type: String, required: [false]}, // Not mandatory for registration
  email: {type: String, required: [true, 'email is required']}, // this may or may not be same as login.username
  phoneNumber: {type: String, required: [false]}, // Not mandatory for registration
  gender: String, // 'male' or 'female'
  image: {
    fileName: {type: String, required: [false]}, // path is not stored. Only filename.ext is stored.
    type: {type: String, required: [false]}, // MIME type of image.
    file: {type: Buffer, required: [false]}, // File contents of the image will be stored in this field.
    imagePath: {type: String, required:[false]}
  },
  video: {
    fileName: {type: String, required: [false]}, // path is not stored. Only filename.ext is stored.
    type: {type: String, required: [false]}, // MIME type of image.
    file: {type: Buffer, required: [false]}, // File contents of the image will be stored in this field.
    videoPath: {type: String, required:[false]}
  },
  socialProfiles : [{
    socialNetworkName: String, // 'facebook', 'linkedin', 'google'
    email: String, // email used to login into the social account
    details: Object, // JSON object as returned by the social network.
  }],
  organization : {type: String, ref: 'Organization'},
  defaultResume : {type: String, ref: 'Resume'}
  // organizations: [{
  //   id: {type: String, ref: 'Organization'},
  //   from: {type: Date, required: [false]},
  //   to: {type: Date, required: [false]},
  //   isPresentEmployer: {type: Boolean, required: [false]},
  // }]
});

exports.Profile  = mongoose.model('Profile', profileSchema);
