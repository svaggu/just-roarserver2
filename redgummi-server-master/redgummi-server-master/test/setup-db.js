/*
 * This script is intended to be used by testers or for demo purposes.
 * This script sets up a sample database.
 */
const mongoose = require('mongoose');
const app = require('express')();
const Utils = require('../lib//models/utilities');
const Config = require('../configuration').configuration;
const Role = require('../lib/models/role-model').Role;
const Profile = require('../lib/models/profile-model').Profile;
const Feedback = require('../lib/models/feedback-model').Feedback;
const Resume = require('../lib/models/resume-model').Resume;
const Job = require('../lib/models/job-model').Job;
const JobProfile = require('../lib/models/job-profile-model').JobProfile;
const IndustryType = require('../lib/models/industry-type-model').IndustryType;
const FunctionalArea = require('../lib/models/functional-area-model').FunctionalArea;
const Video = require('../lib/models/video-model').Video;
const Favourite = require('../lib/models/favourite-model').Favourite;
const EmailTemplate = require('../lib/models/email-template-model').EmailTemplate;
const SearchCriteria = require('../lib/models/search-criteria-model').SearchCriteria;
const CoverLetter = require('../models/cover-letter-model').CoverLetter;
const Organization = require('../models/organization-model').Organization;
const Favourite = require('../models/favourite-model').Favourite;
const CreateAlert = require('../models/create-alert-model').CreateAlert;
const PaymentType = require('../models/payment-type-model').PaymentType;
const AdminUpload = require('../models/admin-upload-model').AdminUpload;

const opts = { server: { socketOptions: { keepAlive: 1 } } };

var roleAdmin = new Role({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  name: 'admin'
});
var roleRecruiter = new Role({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  name: 'recruiter',
});
var roleJobSeeker = new Role({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  name: 'jobseeker',
});
var roleRecruiterAdmin = new Role({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  name: 'recruiterAdmin',
});
var roles = [
  roleRecruiter.save(),
  roleAdmin.save(),
  roleJobSeeker.save(),
  roleRecruiterAdmin.save()
];

var profileSurya = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleAdmin.uuid,
  login: { username: 'surya@snigdha.co.in', password: 'password', },
  firstName: 'Surya',
  lastName: 'Vempati',
  gender: 'male',
  email: 'surya@snigdha.co.in',
  phoneNumber: '+911234567890',
});

var profileAdmin = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleAdmin.uuid,
  login: { username: 'admin@rg.com', password: 'password', },
  firstName: 'Admin',
  lastName: 'Red Gummi',
  gender: '',
  email: 'admin@rg.com',
  phoneNumber: '+911234567890',
});

var profileBidrohaKumarParija = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'bidroha@gmail.com', password: 'password', },
  firstName: 'Bidroha',
  lastName: 'Parija',
  middleName: 'Kumar',
  gender: 'male',
  email: 'bidroha@gmail.com',
  phoneNumber: '+911234567890',
});

var profileChandrapriyaValluri = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'chandrapriya302@gmail.com', password: 'password', },
  firstName: 'Chandrapriya',
  lastName: 'Valluri',
  gender: 'female',
  email: 'chandrapriya302@gmail.com',
  phoneNumber: '+911234567890',
});

var profileChinnaKutumbaRaoDadi = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'chinnatherron@gmail.com', password: 'password', },
  firstName: 'Chinna',
  lastName: 'Dadi',
  middleName: 'Kutumba Rao',
  gender: 'male',
  email: 'chandrapriya302@gmail.com',
  phoneNumber: '+911234567890',
});

var profileSatyanarayanaReddyK = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'satyakng.194@gmail.com', password: 'password', },
  firstName: 'Satyanarayana',
  lastName: 'Reddy',
  middleName: 'K',
  gender: 'male',
  email: 'satyakng.194@gmail.com',
  phoneNumber: '+911234567890',
});

var profileLakshmiPriyankaGorantla = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'priya.gorntla@gmail.com', password: 'password', },
  firstName: 'Lakshmi',
  lastName: 'Gorantla',
  middleName: 'Priyanka',
  gender: 'female',
  email: 'priya.gorntla@gmail.com',
  phoneNumber: '+911234567890',
});

var profileRamyaReddyB = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'ramyapinky09@gmail.com', password: 'password', },
  firstName: 'Ramya',
  lastName: 'Reddy',
  middleName: 'B',
  gender: 'female',
  email: 'ramyapinky09@gmail.com',
  phoneNumber: '+911234567890',
});

var profileSruthiNallamothu = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'n.sruthi1995@gmail.com', password: 'password', },
  firstName: 'Sruthi',
  lastName: 'Nallamothu',
  middleName: '',
  gender: 'female',
  email: 'n.sruthi1995@gmail.com',
  phoneNumber: '+911234567890',
});

var profileSudeepKiran = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'kiransudeep@gmail.com', password: 'password', },
  firstName: 'Sudeep',
  lastName: 'Kiran',
  gender: 'male',
  email: 'kiransudeep@gmail.com',
  phoneNumber: '+911234567890',
});

var profileVijayaSyamKumarDamaraju = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'vijaydsk@outlook.com', password: 'password', },
  firstName: 'Vijaya',
  lastName: 'Damaraju',
  middleName: 'Syam Kumar',
  gender: 'male',
  email: 'vijaydsk@outlook.com',
  phoneNumber: '+911234567890',
});

var profileVinodKumarRayana = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleJobSeeker.uuid,
  login: { username: 'vinodkumar.rayana567@gmail.com', password: 'password', },
  firstName: 'Vinod Kumar',
  lastName: 'Rayana',
  gender: 'male',
  email: 'vinodkumar.rayana567@gmail.com',
  phoneNumber: '+911234567890',
});

var profilePradeepKumar = new Profile({
  uuid: Utils.getUuid(),
  created: { timestamp: Utils.getTimestamp(), by: this.uuid, },
  lastModified: [{ timestamp: Utils.getTimestamp(), by: this.uuid, },],
  status: 'registered',
  role: roleRecruiter.uuid,
  login: { username: 'pradeep.ragiphani007@gmail.com', password: 'password', },
  firstName: 'Pradeep',
  lastName: 'Ragiphani',
  middleName: 'Kumar',
  gender: 'male',
  email: 'pradeep.ragiphani007@gmail.com',
  phoneNumber: '+918686549997',
});

var profiles = [
  profileAdmin.save(),
  profileBidrohaKumarParija.save(),
  profileChandrapriyaValluri.save(),
  profileChinnaKutumbaRaoDadi.save(),
  profileSatyanarayanaReddyK.save(),
  profileLakshmiPriyankaGorantla.save(),
  profileRamyaReddyB.save(),
  profileSruthiNallamothu.save(),
  profileSudeepKiran.save(),
  profileVijayaSyamKumarDamaraju.save(),
  profileVinodKumarRayana.save(),
  profilePradeepKumar.save()
];

const parsedResumeBidrohaKumarParija = require('./resources/resume-bidroha-kumar-parija');
const parsedResumeChandrapriyaValluri = require('./resources/resume-chandrapriya-valluri');
const parsedResumeChinnaKutumbaRaoDadi = require('./resources/resume-chinna-kutumbarao-dadi');
const parsedResumeLakshmiPriyankaGorantla = require('./resources/resume-lakshmi-priyanka-gorantla');
const parsedResumeRamyaReddyB = require('./resources/resume-ramya-reddy-b');
const parsedResumeSatyanarayanaReddyK = require('./resources/resume-satyanarayana-reddy-k');
const parsedResumeSruthiNallamothu = require('./resources/resume-sruthi-nallamothu');
const parsedResumeSudeepKiran = require('./resources/resume-sudeep-kiran');
const parsedResumeVijayaSyamKumarDamaraju = require('./resources/resume-vijaya-syam-kumar-damaraju');
const parsedResumeVinodKumarRayana = require('./resources/resume-vinod-kumar-rayana');

var resumeBidrohaKumarParija = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Bidroha Kumar Parija Resume 1',
  status: 'active',
  parsedJson: parsedResumeBidrohaKumarParija,
  updateParsedJson : parsedResumeBidrohaKumarParija,
  profile: profileBidrohaKumarParija.uuid,
});

var resumeChandrapriyaValluri = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Chandrapriya Valluri Resume 1',
  status: 'active',
  parsedJson: parsedResumeChandrapriyaValluri,
  updateParsedJson: parsedResumeChandrapriyaValluri,
  profile: profileChandrapriyaValluri.uuid,
});

var resumeChinnaKutumbaRaoDadi = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Chinna Kutumba Rao Dadi Resume 1',
  status: 'active',
  parsedJson: parsedResumeChinnaKutumbaRaoDadi,
  updateParsedJson: parsedResumeChinnaKutumbaRaoDadi,
  profile: profileChinnaKutumbaRaoDadi.uuid,
});

var resumeLakshmiPriyankaGorantla = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Lakshmi Priyanka Gorantla Resume 1',
  status: 'active',
  parsedJson: parsedResumeLakshmiPriyankaGorantla,
  updateParsedJson: parsedResumeLakshmiPriyankaGorantla,
  profile: profileLakshmiPriyankaGorantla.uuid,
});

var resumeRamyaReddyB = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Ramya Reddy B Resume 1',
  status: 'active',
  parsedJson: parsedResumeRamyaReddyB,
  updateParsedJson: parsedResumeRamyaReddyB,
  profile: profileRamyaReddyB.uuid,
});

var resumeSatyanarayanaReddyK = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Satyanarayana Reddy K Resume 1',
  status: 'active',
  parsedJson: parsedResumeSatyanarayanaReddyK,
  updateParsedJson: parsedResumeSatyanarayanaReddyK,
  profile: profileSatyanarayanaReddyK.uuid,
});

var resumeSruthiNallamothu = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Sruthi Nallamothu Resume 1',
  status: 'active',
  parsedJson: parsedResumeSruthiNallamothu,
  updateParsedJson: parsedResumeSruthiNallamothu,
  profile: profileSruthiNallamothu.uuid,
});

var resumeSudeepKiran = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Sudeep Kiran Resume 1',
  status: 'active',
  parsedJson: parsedResumeSudeepKiran,
  updateParsedJson: parsedResumeSudeepKiran,
  profile: profileSudeepKiran.uuid,
});

var resumeVijayaSyamKumarDamaraju = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Vijaya Syam Kumar Damaraju Resume 1',
  status: 'active',
  parsedJson: parsedResumeVijayaSyamKumarDamaraju,
  updateParsedJson: parsedResumeVijayaSyamKumarDamaraju,
  profile: profileVijayaSyamKumarDamaraju.uuid,
});

var resumeVinodKumarRayana = new Resume({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  url: 'http://183.82.1.143:9058/jobumes/resumes/Arun.docx',
  name: 'Vinod Kumar Rayana Resume 1',
  status: 'active',
  parsedJson: parsedResumeVinodKumarRayana,
  updateParsedJson: parsedResumeVinodKumarRayana,
  profile: profileVinodKumarRayana.uuid,
});

var resumes = [
  resumeBidrohaKumarParija.save(),
  resumeChandrapriyaValluri.save(),
  resumeChinnaKutumbaRaoDadi.save(),
  resumeLakshmiPriyankaGorantla.save(),
  resumeRamyaReddyB.save(),
  resumeSatyanarayanaReddyK.save(),
  resumeSruthiNallamothu.save(),
  resumeSudeepKiran.save(),
  resumeVijayaSyamKumarDamaraju.save(),
  resumeVinodKumarRayana.save(),
];

var feedback1 = new Feedback({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  thinkingtocommentfor : 2,
  relationship : 1,
  name : 'Hari N',
  emailid: 'hari.n@email.com',
  subject: 'feedback 1',
  comment: 'This is a example comment',
});

var feedback2 = new Feedback({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  thinkingtocommentfor : 1,
  relationship : 2,
  name : 'Mahendar B',
  emailid: 'mahi.b@email.com',
  subject: 'feedback 2',
  comment: 'This is another example comment',
});

var feedbacks = [
  feedback1.save(),
  feedback2.save(),
];

var jobSoftwareDeveloper = new Job({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  name: "Software Developer",
  status: "active",
  profile: profilePradeepKumar.uuid
});

var jobs = [
  jobSoftwareDeveloper.save(),
];

var JobProfileJobSoftwareDeveloperApplicantSudeepKiran = new JobProfile({
  uuid: Utils.getUuid(),
  timestamp: Utils.getTimestamp(),
  applicants:[{
    profile: profileSudeepKiran.uuid,
    appliedOn : Utils.getTimestamp(),
    resume : resumeSudeepKiran.uuid,
  }],
  job: jobSoftwareDeveloper.uuid,
});

var JobProfiles = [
  JobProfileJobSoftwareDeveloperApplicantSudeepKiran.save(),
];

// return mongodb connection string
var getDbConnection = (env) => {
  if (!env || env === undefined) { env = app.get('env'); }

  switch(env) {
    case 'development': return Config.mongo.development.connectionString;
    case 'test': return Config.mongo.test.connectionString;
    case 'production': return Config.mongo.production.connectionString;
    default: return null;
  }
};

//jshint unused:false
var setupDB = (dbConnection) => {
  return new Promise((resolve, reject) => {
    var dbConnectionMustBeClosedOnExit = false;
    if (!dbConnection || dbConnection === undefined) {
      mongoose.connect(getDbConnection(app.get('env')));
      dbConnectionMustBeClosedOnExit = true; // DB connection must not be closed if sent by a calling method
    }
    Promise.all([
      roles,
      profiles,
      feedbacks,
      resumes,
      jobs,
      JobProfiles,
    ])
    .then(messages => {
      messages.forEach(m => {console.info('\nsaved %j', m);});
      if (dbConnectionMustBeClosedOnExit) { mongoose.disconnect(); }
      resolve(true);
    })
    .catch(err => {
      if (dbConnectionMustBeClosedOnExit) { mongoose.disconnect(); }
      reject(err);
    });
  });
};

if (require.main === module) {
  setupDB()
  .then(result => { console.info('result: ' + result); })
  .catch(err => { console.error('err: ' + err); });
}
else {
  module.exports = {setupDB};
}
