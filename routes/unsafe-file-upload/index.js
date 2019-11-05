'use strict';

const path = require('path');
const fs = require('fs');
const pluginName = 'hapitestbench.unsafefileupload';

exports.register = function unsafeFileUpload(server, options, next) {
  server.route({
    method: 'GET',
    path: '/',
    handler: {
      view: 'unsafe-file-upload'
    }
  });

  server.route({
    method: 'POST',
    path: '/submit',
    config: {
      handler(request, reply) {
        const { payload } = request;

        if (payload.filem) {
          const name = payload.filem.hapi.filename;
          const filePath = path.join(__dirname, '../../uploads', name);
          const file = fs.createWriteStream(filePath);

          file.on('error', (err) => console.error(err));

          payload.filem.pipe(file);
        }

        reply('OK');
      },
      payload: {
        output: 'stream',
        parse: true
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: pluginName
};
