var BasicAuth = require('basic-auth');

var Validator = require('../security/validator');
var utils = require('../models/utilities');
var errors = require('../security/errors');

var AdminService = require('../services/admin-service');
var RoleManagementService = require('../services/role-management-service');
var ProfileManagementService = require('../services/profile-management-service');
var RoleManagementService = require('../services/role-management-service');
var AlertService = require('../services/alert-service');


/**
 * @api {get} / Get all jobs posted
 * @apiName getAllJobsPosted
 * @apiGroup Jobs
 *
 * @apiParam None
 *
 * @apiSuccess (200) {Jobs[]} Jobs Array of Jobs.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [{
	"employerDetails": {
		"_id": "58d3a9280c99bf2e0ced15d6",
		"uuid": "b7f3e0ab-155f-4239-8c39-aef716a645ef",
		"status": "registered",
		"role": "eaf59120-c75b-4839-83ed-8e42d7d1da94",
		"firstName": "Pradeep",
		"lastName": "Ragiphani",
		"middleName": "Kumar",
		"gender": "male",
		"email": "pradeep.ragiphani007@gmail.com",
		"phoneNumber": "+918686549997",
		"socialProfiles": [],
		"login": {
			"username": "pradeep.ragiphani007@gmail.com"
		},
		"lastModified": [{
			"_id": "58de298d68c3c91370ef864e",
			"timestamp": "2017-03-31T10:03:57.729Z",
			"by": "b7f3e0ab-155f-4239-8c39-aef716a645ef"
		}],
		"created": {
			"timestamp": "2017-03-23T10:53:28.263Z"
		}
	},
	"jobUuid": "e67b2654-acc0-477a-8566-f57b74ea158b",
	"timestamp": "2017-03-27T13:10:49.099Z",
	"name": "jd-sample-1.txt",
	"status": "active",
	"parsedJson": {
		"JobData": {
			"JobDescription": ["Java Developer \rTALENT ASSURE EDUCATION SERVICES PVT LTD - Delhi , Delhi \rOpening: 3-4\rGood communication skills\r Experience of working in Advance Java , Swing , J2EE , Servlets , Struts , WEB &amp; WAP\rServices , Spring , Hibernate , Java Script , SQL , PL/SQL , JQuery , AJAX.\r Exposure to Software Development Life Cycles (SDLC).\r Worked on J2EE framework.\r Understanding of Eclipse , Java , JMS and JDBC , XML and XPath Basic , SOAP and\rWSDL Basic with good understanding of databases.\rKey Skills\r Advance Java\r Struts\r Hibernate\r Swing\rMinimum 1-2 year experience required\rJob Type: Full-time\r\rSalary: Rs 40 , 000.00 /month\r\rRequired education:\r\rB.Tech/ MCA /BCA\r\rContact Person\rPradeep Kumar\r9874563210\rparadeep104@gmail.com"],
			"InterviewLocation": [""],
			"InterviewTime": [""],
			"InterviewDate": [""],
			"InterviewType": [""],
			"WebSite": [""],
			"ContactPersonName": ["Pradeep Kumar"],
			"ContactPhone": [""],
			"ContactEmail": ["paradeep104@gmail.com"],
			"Skills": [{
				"Skill": [{
					"type": {
						"type": "required"
					},
					"name": "Advance Java"
				}, {
					"type": {
						"type": "required"
					},
					"name": "Swing"
				}, {
					"type": {
						"type": "required"
					},
					"name": "J2EE"
				}, {
					"type": {
						"type": "required"
					},
					"name": "Servlets"
				}, {
					"type": {
						"type": "required"
					},
					"name": "Struts"
				}, {
					"type": {
						"type": "required"
					},
					"name": "WAP"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Communication Skills"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Hibernate"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Java Script"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "SQL"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "PL/SQL"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "JQuery"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "AJAX"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Software Development Life Cycles"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "SDLC"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "J2EE Framework"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Java"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "JMS and JDBC"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "XML and XPath Basic"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "SOAP And"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "WSDL Basic"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Databases"
				}, {
					"type": {
						"type": "perferred"
					},
					"name": "Key Skills"
				}]
			}],
			"Certifications": [""],
			"Qualifications": [""],
			"Relocation": [""],
			"NoOfOpenings": ["3"],
			"NoticePeriod": [""],
			"SalaryOffered": ["Rs 40, 000.00/month"],
			"ExperienceRequired": ["1-2 year"],
			"PostedOnDate": [""],
			"IndustryType": [""],
			"JobType": ["Full-time"],
			"JobCode": [""],
			"Location": ["Delhi"],
			"Organization": ["TALENT ASSURE EDUCATION SERVICES PVT LTD"],
			"JobProfile": ["Java Developer"],
			"ParsingDate": ["Mon Mar 27 13:10:53 UTC 2017"],
			"FileName": ["jd-sample-1.txt"]
		}
	}
}, {
	"jobsCount": 2
}]
 */
//implemet

//jshint unused:false
exports.getAllJobsPosted = (req, res) => {
  if (utils.isEmptyObj(req.query)) {
    return res.status(errors.emptyRequestQuery.code).send(errors.emptyRequestQuery).end();
  }
  Validator.isUserAdmin(req)
  .then(result => {
    var params = {};
    params.period = (req.query.period === 'total') ? -1 : Number(req.query.period);
    params.moreInfo = (req.query.moreInfo === 'true') ? true : false;
    return AdminService.getAllJobsPosted(params);
  })
  .then(dto => { return res.status(200).send(dto).end(); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};

// To get all the employers registered in certain period of timestamp
//jshint unused:false
exports.getAllRecruiterProfiles = (req, res) => {
  if (utils.isEmptyObj(req.query)) {
    return res.status(errors.emptyRequestQuery.code).send(errors.emptyRequestQuery).end();
  }
  var role1,role2;
  Validator.isUserAdmin(req)
  .then(result => { return RoleManagementService.getRoleByRoleName("recruiter"); })
  .then(recruiterRole => {
    role1 = recruiterRole.uuid;
    return RoleManagementService.getRoleByRoleName("recruiterAdmin"); })
  .then(role => {
    role2 = role.uuid;
    var params = {};
    params.period = (req.query.period === 'total') ? -1 : Number(req.query.period);
    params.moreInfo = (req.query.moreInfo === 'true') ? true : false;
    return AdminService.getProfilesByRole(params,role1,role2);
  })
  .then(dto => { return res.status(200).send(dto).end(); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};

// To get all the job seekers registered in certain period of timestamp
//jshint unused:false
exports.getAllEmployeeProfiles = (req, res) => {
  if (utils.isEmptyObj(req.query)) {
    return res.status(errors.emptyRequestQuery.code).send(errors.emptyRequestQuery).end();
  }
  Validator.isUserAdmin(req)
  .then(result => { return RoleManagementService.getRoleByRoleName("jobseeker"); })
  .then(role => {
    var params = {};
    params.period = (req.query.period === 'total') ? -1 : Number(req.query.period);
    params.moreInfo = (req.query.moreInfo === 'true') ? true : false;
    return AdminService.getJobSeekersProfiles(params,role.uuid);
  })
  .then(dto => { return res.status(200).send(dto).end(); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};

//jshint unused:false
exports.getAllJobsAlerts = (req, res) => {
  if (utils.isEmptyObj(req.query)) {
    return res.status(errors.emptyRequestQuery.code).send(errors.emptyRequestQuery).end();
  }
  Validator.isUserAdmin(req)
  .then(result => {
    var params = {};
    params.period = (req.query.period === 'total') ? -1 : Number(req.query.period);
    params.moreInfo = (req.query.moreInfo === 'true') ? true : false;
    return AdminService.getAllJobsAlerts(params);
  })
  .then(dto => { return res.status(200).send(dto).end(); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err).end();
  });
};

// Payment Types
exports.addPaymentType = (req, res) => {
 "use strict";

 if (utils.isEmptyObj(req.body)) { return res.status(400).send(errors.emptyRequestBody).end(); }

 Validator.isValidCredentials(req)
 .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
 .then(userProfile =>{ return AdminService.addPaymentType(userProfile.uuid,req.body); })
 .then(createdType => { return res.status(201).send(createdType).end(); })
 .catch(err => {
   console.info('err: %j', err);
   return res.status(err.code).send(err).end();
 });
};

// Get All alerts by user
exports.getPaymentTypes = (req, res) => {
  "use strict";

  Validator.isValidCredentials(req)
  .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
  .then(profile => { return AdminService.getPaymentTypes(profile.uuid); })
  .then(types => { return res.status('200').send(types); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

exports.editPaymentType = (req, res) => {
 "use strict";

 if (utils.isEmptyObj(req.body)) { return res.status(400).send(errors.emptyRequestBody).end(); }

 Validator.isValidCredentials(req)
 .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
 .then(userProfile =>{ return AdminService.editPaymentType(userProfile.uuid,req.body); })
 .then(editedType => { return res.status(201).send(editedType).end(); })
 .catch(err => {
   console.info('err: %j', err);
   return res.status(err.code).send(err).end();
 });
};
// End of Payment Types


//jshint unused:false
  exports.uploadFile = (req, res) => {
    "use strict";

    Validator.isValidCredentials(req)
    .then(result => { return ProfileManagementService.getProfileByAuthCredentials(req); })
    .then(profile => { return AdminService.uploadFile(profile.uuid, req.file); })
    .then(uploadedFile => { return res.status(200).send(uploadedFile); })
    .catch(err => {
      console.error('Err: %s', JSON.stringify(err));
      return res.status(err.code).send(err);
    });
  };
