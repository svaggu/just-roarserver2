var Video = require('../models/video-model').Video;
var Errors = require('../security/errors');

exports.getVideoByProfile = (profileUuid) => {
  return new Promise(
    (resolve, reject) => {
      Video.find({profile: profileUuid}).exec()
      .then(videos => {
        if (!videos || videos === undefined) {
          throw(Errors.userVideosCouldNotBeFound);
        }
      //  console.log('videos from services: : %j  ',videos);
        resolve(videos);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};

exports.addVideo = (video) => {
  return new Promise(
    (resolve, reject) => {
      var videoToSave = new Video(video);

      videoToSave.save()
      .then(savedVideo => {
        console.log("video saved: "+JSON.stringify(savedVideo.uuid));
        resolve(savedVideo);
      })
      .catch(err => {
        if (err.code === undefined) {
          reject({code: '500', reason: err});
        }
        reject(err);
      });
  });
};
