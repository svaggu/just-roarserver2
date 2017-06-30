/*
 * This script is intended to be used by testers or for demo purposes.
 * This script cleans up the test database.  It removes all documents from all collections.
 */
var mongoose = require('mongoose');

const Config = require('../configuration').configuration;
const Role = require('../lib/models/role-model').Role;
const Profile = require('../lib/models/profile-model').Profile;
const Feedback = require('../lib/models/feedback-model').Feedback;
const SocialProfile = require('../lib/models/socialprofile-model').SocialProfile;
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
var args = null;

var printHelp = () => {
  console.log(
    'node cleanup-db.js [OPTIONS]...  \n' +
    'cleans up selected documents from the centilio database. \n' +
    '\n[OPTIONS] \n' +
    '-h [or] --help: Prints this help message \n' +
    '-a [or] --all: Removes all documents from all collections. This is the default option if no other option is provided.\n' +
    '--roles: Removes all documents in roles collection.\n' +
    '--profiles: Removes all documents in profiles collection.\n' +
    '--resumes: Removes all resumes in resumes collection.\n' +
    '--feedbacks: Removes all feedbacks in feedcbacks collection.\n' +
    '--jobs: Removes all jobs in jobs collection.\n' +
    '--JobProfiles: Removes all jobs in JobProfile collection.\n' +
    '\n[EXAMPLE USAGE] \n' +
    '1. node cleanup-data.js --all \n' +
    'Removes all documents from all collections. \n' +
    '2. node cleanup-data.js \n' +
    'Removes all documents from all collections. \n' +
    '3. node cleanup-data.js --deviceReadings \n' +
    'Removes all documents from deviceReadings only while keeping all other collections intact. \n' +
    '5. node cleanup-data.js --help \n' +
    'Displays this help message. \n' +
    '6. node cleanup-data.js --xyz \n' +
    'Unknown option. Displays this help message. \n'
  );
};

//jshint unused:false
function _createPromises(args, conn) {
  return new Promise((resolve, reject) => {
    var promises = [];
    if (args.length === 0) { args.push('--all'); }
    args.forEach(arg => {
      switch (arg) {
        case '--roles':          promises.push(conn.model('Role').remove()); break;
        case '--profiles':       promises.push(conn.model('Profile').remove()); break;
        case '--resumes':       promises.push(conn.model('Resume').remove()); break;
        case '--feedbacks':       promises.push(conn.model('Feedback').remove()); break;
        case '--jobs':       promises.push(conn.model('Job').remove()); break;
        case '--jobProfiles':       promises.push(conn.model('JobProfile').remove()); break;
        case '-a': // fall-through to --all
        case '--all':
          promises.push(conn.model('Role').remove());
          promises.push(conn.model('Profile').remove());
          promises.push(conn.model('Resume').remove());
          promises.push(conn.model('Feedback').remove());
          promises.push(conn.model('Job').remove());
          promises.push(conn.model('JobProfile').remove());
          break;
        case '-h': // fall-through to --help
        case '--help': // fall-through to default
          printHelp();
          promises = null;
          break;
        default:
          printHelp();
          promises = null;
          break;
      }
    });
    resolve(promises);
  });
}

//jshint unused:false
function _createDbConnection(dbConnection) {
  return new Promise((resolve, reject) => {
    console.info('dbConnection: '+dbConnection);
    var conn = (!dbConnection || dbConnection === undefined) ? mongoose.createConnection(Config.mongo.development.connectionString, opts) :
    dbConnection;

    conn.on('connecting', () => {console.log('\nconnecting to DB');});
    conn.on('connected', () => {console.log('\nconnected to DB');});
    conn.on('open', () => { console.log('\nopened connection to DB'); });
    conn.on('disconnecting', () => {console.log('\ndisconnecting from DB');});
    conn.on('disconnected', () => {console.log('\ndisconnected from DB');});
    conn.on('close', () => {console.log('\nconnection to DB closed');});
    conn.on('reconnected', () => {console.log('\nreconnected to DB');});
    conn.on('error', (err) => {console.log('\nError raised: ' + err + err.stack);});

    resolve(conn);
  });
}

var cleanupDB = (dbConnection, args) => {
  return new Promise((resolve, reject) => {
    var dbConn = null;
    _createDbConnection(dbConnection)
    .then(conn => {
      dbConn = conn;
      return _createPromises(args, conn);
    })
    .then(promises => { return Promise.all(promises); })
    .then(entities => {
      entities.forEach(e => {console.log('Removed ' + JSON.stringify(e) + ' documents');});
      return dbConn.close();
    })
    .then(() => { resolve(true); })
    .catch(err => {
      console.error('\nerror deleting all documents: ' + err.stack);
      dbConn.close();
      reject(err);
    });
  });
};

if (require.main === module) {
  args = process.argv.slice(2);

  if (args[0] === '-h' || args[0] === '--help') {
    printHelp();
    process.exit();
  }

  cleanupDB(null, args)
  .then(result => { console.log('\nresult: ' + result); process.exit(); })
  .catch(err => { console.log('\nerror while clearing all records: ' + err); });
}
else {
  module.exports = {cleanupDB};
}
