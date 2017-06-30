var Job = require('../models/job-model').Job;
var Profile = require('../models/profile-model').Profile;
var EmailTemplate = require('../models/email-template-model').EmailTemplate;
var Errors = require('../security/errors');
var Utils = require('../models/utilities');
var ProfileManagementService = require('../services/profile-management-service');
const orgManagementService = require('../services/organization-management-service');
const nodemailer = require('nodemailer');
var async = require('async');
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
});

//jshint unused:false
exports.sendEmail = (mailOptions) => {
  return new Promise(
    (resolve, reject) => {
       var result;
      transporter.sendMail(mailOptions, function (err, res) {
        if(err){
            console.log('Error',err);
            result = "Error in sending Email.";

        } else {
            console.log('Email Sent');
            result = "Email sent Successfully";
        }
        resolve(result);
      });
// console.log("1");
//       var users = [
//   {
//     email: 'vempatisurya@gmail.com',
//     name: {
//       first: 'Surya',
//       last: 'Vempati'
//     }
//   },
//   {
//     email: 'pravallika.ragipani@gmail.com',
//     name: {
//       first: 'Pravallika',
//       last: 'Ragipani'
//     }
//   },
//   {
//     email: 'pradeep.ragiphani007@gmail.com',
//     name: {
//       first: 'Pradeep',
//       last: 'Ragipani'
//     }
//   },
//   {
//     email: 'naga.sarva@gmail.com',
//     name: {
//       first: 'Nagashwin',
//       last: 'Sarvadevabatla'
//     }
//   }
// ];
//       // Send 10 mails at once
//       var count = 10;
// async.mapLimit(users, count, function (item, next) {
//     if (err) return next(err)
//     var modifiedText = "Dear "+item.name.first+" "+item.name.last+",\n I'm just testing the feature of sending multiple mails at a time. Sorry for the inconvinience.\n\n\n Thanks & Regards \n Red-Gummi.";
//     console.log("modifiedText :: "+modifiedText);
//     transport.sendMail({
//       from: 'Admin<aredgummi@gmail.com>',
//       to: item.email,
//       subject: 'Testing Multiple emails',
//       // html: results.html,
//       text: modifiedText
//     }, function (err, responseStatus) {
//       if (err) {
//         return next(err);
//       }
//       next(null, responseStatus.message);
//     })
//
// }, function (err,res) {
//   if (err) {
//     console.error(err);
//     result = "error";
//     resolve(result);
//   }else{
//     console.log('Succesfully sent %d messages', users.length);
//     result = "true";
//     resolve(result);
//   }
//
// })
      // .then(sendResult => {
      //
      // })
      // .catch(err => {
      //   console.error('Err: %s', JSON.stringify(err));
      //   return res.status(err.code).send(err).end();
      // });
  });
};

var _validateExists = (profileUuid,mail) => {
  return new Promise(
    (resolve, reject) => {
      if(!mail.title || mail.title === undefined) { throw (Errors.emptyTitle); }
      if(!mail.text || mail.text === undefined) { throw (Errors.emptyText); }
      if(!mail.subject || mail.subject === undefined) { throw (Errors.emptySubject); }

      EmailTemplate.findOne({"title":mail.title}).exec()
      .then(user => {
        if (!user || user === undefined || user === null ) { resolve({exists: false, status: "new" }); }
        else {
          reject(Errors.duplicateTemplate);
        };

      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.createMailTemplate = (profileUuid,mail) => {
  return new Promise(
    (resolve, reject) => {
      _validateExists(profileUuid,mail)
      .then(validatedUser => {
        var created = {};
        created.timestamp = Utils.getTimestamp();
        created.by = profileUuid;
        var lastModified = {};
        lastModified.timestamp = Utils.getTimestamp();
        lastModified.by = profileUuid;

          var templateToSave = new EmailTemplate({
            uuid: Utils.getUuid(),
            created: created,
            lastModified: lastModified,
            status: "active",
            title: mail.title,
            subject: mail.subject,
            text: mail.text,
            profile : profileUuid
          });

          templateToSave.save()
          .then(createdEmail => {
            resolve(createdEmail); })
          .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
            reject(err);
          });
        })
        .catch(err => {
          if (err.code === undefined) { reject({code: '500', reason: err}); }
          reject(err);
        });
  });
};

exports.listTemplates = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      EmailTemplate.find()
       .then(templates => { resolve(templates); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};

exports.editMailTemplate = (modifiedBy,template) => {
  "use strict";

  return new Promise(
    (resolve, reject) => {
      var lastModified = {};
      lastModified.timestamp = Utils.getTimestamp();
      lastModified.by = modifiedBy;

      var query = {"uuid": template.uuid};
      var update = {$set:{"lastModified":lastModified,"status":template.status,"subject":template.subject,"text":template.text}};

      var retrieveData = {"uuid":1,"created":1,"lastModified":1,"status":1,"title":1,"subject":1,"text":1,"profile":1};

      EmailTemplate.findOneAndUpdate(query, update).exec()
      .then(savedTemplate => {
        return EmailTemplate.find(query,retrieveData);
      }).then(modifiedTemplate => {
        resolve(modifiedTemplate);
      })
      .catch(err => {
        if (err.code === undefined) { reject({code: '500', reason: err}); }
        reject(err);
      });
  });
};

exports.getMailTemplate = (templateName) => {
  return new Promise(
    (resolve, reject) => {
      EmailTemplate.find({"title":templateName}).exec()
       .then(template => {
         console.log(('template :: %j',template));
         resolve(template); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};
