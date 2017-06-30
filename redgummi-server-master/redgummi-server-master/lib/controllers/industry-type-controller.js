var utils = require('../models/utilities');
var IndustryTypeManagementService = require('../services/industry-type-management-service');
var Validator = require('../security/validator');

/**
 * @api {get} /roles Get all available roles
 * @apiName getAllRoles
 * @apiGroup Role
 *
 * @apiParam None
 *
 * @apiSuccess (200) {Role[]} Roles Array of roles.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "roles":
 *     [
 *       {
 *         "uuid": "491eeac5-f7c5-4c08-a19a-0dc376098702",
 *         "timestamp": "2016-12-30T12:32:20.819Z",
 *         "name": "admin",
 *         "status": "active"
 *       },
 *       {
 *         "uuid": "491eeac5-f7c5-4c08-a19a-0dc376098702",
 *         "timestamp": "2016-12-30T12:32:20.819Z",
 *         "name": "recruiter",
 *         "status": "active"
 *       },
 *       {
 *         "uuid": "491eeac5-f7c5-4c08-a19a-0dc376098702",
 *         "timestamp": "2016-12-30T12:32:20.819Z",
 *         "name": "jobseeker",
 *         "status": "active"
 *       },
 *     ]
 * }
 */
exports.getAllIndustryTypes = (req, res) => {
  "use strict";

  IndustryTypeManagementService.getAllIndustryTypes()
  .then(industrytypes => { return res.status('200').send(industrytypes); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};

/**
 * @api {post} /roles Add a new role
 * @apiName addRole
 * @apiGroup Role
 *
 * @apiParam (role) {Role} Role Give a role as JSON
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.  Request-Example:
 * {
 *   "name": "jobseeker"
 * }
 *
 * @apiSuccess (201) {Role} Role Created role is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 * {
 *   "uuid": "88b28115-b859-452c-9fb4-5323c9ed69e6",
 *   "timestamp": 1483166090614,
 *   "name": "jobseeker"
 * }
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.addIndustryType = (req, res) => {
  if (!req || !req.body) { return res.status(400).send('Bad Request'); }

  Validator.isUserAdmin(req)
  .then(result => {
    console.error('user [' + req.user + '] valildated: ' + result );
    var industrytype = {
      uuid: utils.getUuid(),
      timestamp: utils.getTimestamp(),
      name: req.body.name,
      status: 'active',
    };
    return IndustryTypeManagementService.addIndustryType(industrytype);
  })
  .then(savedIndustryType => { return res.status('201').send(savedIndustryType); })
  .catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
