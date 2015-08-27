var Connection = require('./');
var params = require('./token.json');

params.access_token = 'nimp';
params.track = ['yes', 'no'].join();

var stream = new Connection(params);
stream.pipe(process.stdout);

stream.on('error', function(err) {
  console.log(err);
});
