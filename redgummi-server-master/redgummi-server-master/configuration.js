var configuration = {
  server: {
    // port that this sever will listen on
    port: 9060,
    // folder to store uploaded resumes, jobs, images, videos, ...
    // This is optional. If not provided then uploaded will be stored in <project-root>/tmp/redgummi-uploads/
    uploadsFolder: '/tmp/redgummi-uploads',
  },
  mongo: {
    development: {connectionString: 'mongodb://localhost/jobumes-development',},
    test: {connectionString: 'mongodb://localhost/jobumes-test',},
    production: {connectionString: 'mongodb://produser:resudorp@ds145158.mlab.com:45158/jobumes-prod',},
  },
  resumeParser: {
    host: 'redgummi1.rchilli.com',
    port: 80,
    path: '/RChilliParser/Rchilli/parseResumeBinary',
    method:'POST',
    userKey: 'YOABEO3303Q',
    version: '7.0.0',
    subUserId: 'redgummi',
    timeout: 120 * 1000
  },
  jdParser: {
    serviceUrl: 'http://redgummijd.rchilli.com/JDParser/services/JDParser?wsdl',
    userKey: 'YOABEO3303Q',
    version: '2.0',
    subUserId: 'redgummi',
    timeout: 120 * 1000
  },
};

module.exports = {configuration};
