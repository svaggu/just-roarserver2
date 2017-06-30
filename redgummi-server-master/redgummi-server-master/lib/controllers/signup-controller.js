var SignupManagementService = require('../services/signup-management-service');
var RoleManagementService = require('../services/role-management-service');
var MailService = require('../services/mail-service');
var Errors = require('../security/errors');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: 'aredgummi@gmail.com',
     pass:'redgummi123'
            // clientId: '163224009781-sl6let00gr7rkh2amiiuo1ov8hd62s6u.apps.googleusercontent.com',
            // clientSecret: 'Tk9na4aNwQW2TnSis1vq6TqE',
            // refreshToken: '1/Ag8OIJyjnLefihl43WGtWiaY-l8f_vkv9RkuJf-DwB4'
    }
})

/**
 * @api {post} /users Add a new user
 * @apiName addUser
 * @apiGroup User
 *
 * @apiParam (user) {Credentials} credentials Credentials of the logged in user
 * @apiParamExample {json} Request-header "Content-Type: application/json" must be set.
 *                  {json} Request-header Basic Authentication details must ne set. This should be changed to
 *                         stateless JWT based token based authentication.
 *                  {json} Request-body should send the new user name, passsword, role type in the following format.
 * {
 *   "username" : "testing2345@gmail.com",
 *   "role": "e0ec7c05-3832-4080-a2c5-d63dfb0a7a17",
 *   "status": "new user",
 *   "socialNetwork": "facebook",
 *   "details": {
 *     "firstName" : "Pravallika",
 *     "middleName" : " ",
 *     "lastName" : "Ragipani",
 *     "gender" : "female",
 *     "username" : "testing2345@gmail.com"
 *   }
 * }
 *
 * @apiSuccess (201) {User} user Created user is returned as JSON.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *
 * @apiError (400) {String} BadRequest Error code 400 is returned if the JSON format is incorrect.
 * @apiError (400) {String} BadRequest Error code 400 is returned if the username already exists.
 * @apiError (500) {String} InternalServerError Error code 500 is returned in case of some error in the server.
 */
exports.addNewUser = function (req, res) {
  "use strict";
  var registeredUserDTO = [];
  if(!req.body || req.body === undefined) { throw (Errors.emptyRequestBody); }
  RoleManagementService.getRoleByRoleName(req.body.role)
  .then(role => {
    var roleDetails = {};
    roleDetails.roleInfo = role;
    console.log('roleDetails :: %j',roleDetails);
    registeredUserDTO.push(roleDetails);
    return SignupManagementService.addNewUser(req.body,role.uuid); })
  .then(userDTO => {
    if (userDTO.exists) {
      console.info('user (%s) is already present', userDTO.profile.email);
      registeredUserDTO.push(userDTO.profile);
      return res.status(200).send(registeredUserDTO);
    } else {
      MailService.getMailTemplate("Registration")
      .then(template => {
        var modifiedText = "Dear "+req.body.firstName+" "+req.body.lastName+",\n"+template[0].text+"\n\n\n Thanks & Regards \n Red-Gummi.";
          var mailOptions = {
              from: 'Admin<aredgummi@gmail.com>',
              to: ''+req.body.username,
              subject: ''+template[0].subject,
              text: ''+modifiedText
          }
          transporter.sendMail(mailOptions, function (err, res) {
            if(err){
                console.log('Error',err);
            } else {
                console.log('Email Sent');
            }
          })
          console.info('added new user: (%s)', userDTO.profile.email);
          registeredUserDTO.push(userDTO.profile);
          return res.status(201).send(registeredUserDTO);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });


    }
  }).catch(err => {
    console.error('Err: %s', JSON.stringify(err));
    return res.status(err.code).send(err);
  });
};
