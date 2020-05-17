const StaticServer = require('static-server');
const path = require('path');

const server = new StaticServer({
  rootPath: path.join(__dirname, '../dist/'),
  port: 8080,
  cors: '*',
});

server.start(function () {
  console.log('Server listening to', server.port);
});

