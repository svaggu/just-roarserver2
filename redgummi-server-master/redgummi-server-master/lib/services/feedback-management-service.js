var Feedback = require('../models/feedback-model').Feedback;

exports.addFeedback = (credentials, newEmployeeFeedbackDetails) => {
  return new Promise(
    (resolve, reject) => {
      var feedbackToSave = new Feedback(newEmployeeFeedbackDetails);

      feedbackToSave.save()
      .then(feedback => {
        console.log("feedback saved: "+JSON.stringify(feedback.uuid));
        resolve(feedback);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.getAllFeedbacks = () => {
  return new Promise(
    (resolve, reject) => {
      Feedback.find()
       .then(feedbacks => { resolve(feedbacks); })
       .catch(err => {
         if (err.code === undefined) {
           reject({code: '500', reason: err});
         }
         reject(err);
       });
  });
};
