const assert = require('chai').assert;
const restler = require('restler');
const errors = require('../lib/security/errors');
const utilities = require('../lib/models/utilities');

const Organization = require('../lib/models/organization-model').Organization;
const Profile = require('../lib/models/profile-model').Profile;
const Role = require('../lib/models/role-model').Role;

var baseUrl = 'http://localhost:9060/organizations';

//jshint unused:false
describe('/organizations integration tests', () => {
  it('should throw error when empty req body sent to add new org ', (done) => {
    restler.postJson(baseUrl, null)
    .on('4XX', (data, response) => {
      assert(response.statusCode === 400);
      assert(data !== null);
      assert(data.code === errors.emptyRequestBody.code);
      assert(data.reason === errors.emptyRequestBody.reason);
      done();
    });
  });

  it('should throw error when no credentials sent to add new org ', (done) => {
    var json = {
      name:  'Snigdha',
      logo: { uri: 'http://www.snigdha.co.in/images/logo.png' },
      status: 'active',
      description: 'Snigdha provides a broad portfolio of information technology solutions and business process to its clients worldwide. Our core portfolio comprises application development, business process consulting services as well as professional staffing services in information-technology.',
      address: {
        line1: '# 102, Madhu Residency, Patrika Nagar',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        zip: '500081',
        googleMapsUri: 'https://www.google.co.in/maps/place/Patrika+Nagar,+HITEC+City,+Hyderabad,+Telangana+500081/@17.4489901,78.378935,17z/data=!3m1!4b1!4m5!3m4!1s0x3bcb93df022b64f1:0x3704109dea29aa2e!8m2!3d17.4471055!4d78.3795977',
      },
      internet: [{ name: 'primary', url: 'http://www.snigdha.co.in/' }],
      email: [{ name: 'primary', id: 'info@snigdha.co.in', }],
      phone: [{ name: 'primary', number: '+914040128028' }],
      socialProfile : [{ name: 'facebook', url: 'https://www.facebook.com/SnigdhaTechnosoftPvtLtd/' }]
    };
    restler.postJson(baseUrl, json)
    .on('4XX', (data, response) => {
      assert(response.statusCode === 403);
      assert(data !== null);
      assert(data.code === errors.invalidCredentials.code);
      assert(data.reason === errors.invalidCredentials.reason);
      done();
    });
  });

  it('should throw error when invalid credentials sent to add new org ', (done) => {
    var json = {
      name:  'Snigdha',
      logo: { uri: 'http://www.snigdha.co.in/images/logo.png' },
      status: 'active',
      description: 'Snigdha provides a broad portfolio of information technology solutions and business process to its clients worldwide. Our core portfolio comprises application development, business process consulting services as well as professional staffing services in information-technology.',
      address: {
        line1: '# 102, Madhu Residency, Patrika Nagar',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        zip: '500081',
        googleMapsUri: 'https://www.google.co.in/maps/place/Patrika+Nagar,+HITEC+City,+Hyderabad,+Telangana+500081/@17.4489901,78.378935,17z/data=!3m1!4b1!4m5!3m4!1s0x3bcb93df022b64f1:0x3704109dea29aa2e!8m2!3d17.4471055!4d78.3795977',
      },
      internet: [{ name: 'primary', url: 'http://www.snigdha.co.in/' }],
      email: [{ name: 'primary', id: 'info@snigdha.co.in', }],
      phone: [{ name: 'primary', number: '+914040128028' }],
      socialProfile : [{ name: 'facebook', url: 'https://www.facebook.com/SnigdhaTechnosoftPvtLtd/' }]
    };
    restler.postJson(baseUrl, json, {username:'abc@gmail.com', password:'password'})
    .on('4XX', (data, response) => {
      assert(response.statusCode === 403);
      assert(data !== null);
      assert(data.code === errors.invalidCredentials.code);
      assert(data.reason === errors.invalidCredentials.reason);
      done();
    });
  });

  it('add new org - should pass when all fields provided', (done) => {
    var json = {
      name:  'Snigdha',
      logo: { uri: 'http://www.snigdha.co.in/images/logo.png' },
      status: 'active',
      description: 'Snigdha provides a broad portfolio of information technology solutions and business process to its clients worldwide. Our core portfolio comprises application development, business process consulting services as well as professional staffing services in information-technology.',
      address: {
        line1: '# 102, Madhu Residency, Patrika Nagar',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        zip: '500081',
        googleMapsUri: 'https://www.google.co.in/maps/place/Patrika+Nagar,+HITEC+City,+Hyderabad,+Telangana+500081/@17.4489901,78.378935,17z/data=!3m1!4b1!4m5!3m4!1s0x3bcb93df022b64f1:0x3704109dea29aa2e!8m2!3d17.4471055!4d78.3795977',
      },
      internet: [{ name: 'primary', url: 'http://www.snigdha.co.in/' }],
      email: [{ name: 'primary', id: 'info@snigdha.co.in', }],
      phone: [{ name: 'primary', number: '+914040128028' }],
      socialProfile : [{ name: 'facebook', url: 'https://www.facebook.com/SnigdhaTechnosoftPvtLtd/' }]
    };
    restler.postJson(baseUrl, json, {username:'testuser@gmail.com', password:'testpassword', headers: {'role': 'jobseeker'}})
    .on('success', (data, response) => {
      console.log('success:');
      assert(data !== null);
      assert(data.uuid !== null);
      assert(data.name === 'Snigdha');
      assert(data.description === 'Snigdha provides a broad portfolio of information technology solutions and business process to its clients worldwide. Our core portfolio comprises application development, business process consulting services as well as professional staffing services in information-technology.');
      assert(data.address.line1 === '# 102, Madhu Residency, Patrika Nagar');
      assert(data.address.city === 'Hyderabad');
      assert(data.address.state === 'Telangana');
      assert(data.address.country === 'India');
      assert(data.address.zip === '500081');
      assert(data.address.googleMapsUri === 'https://www.google.co.in/maps/place/Patrika+Nagar,+HITEC+City,+Hyderabad,+Telangana+500081/@17.4489901,78.378935,17z/data=!3m1!4b1!4m5!3m4!1s0x3bcb93df022b64f1:0x3704109dea29aa2e!8m2!3d17.4471055!4d78.3795977');
      assert(data.internet !== null);
      assert(data.email !== null);
      assert(data.phone !== null);
      assert(data.socialProfile !== null);
      assert(response !== null);
      done();
    });
  });
});
