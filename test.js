var Connection = require('./');
var params = require('./token.json');

params.track = ['yes', 'no'].join();

var stream = new Connection(params);
stream.pipe(process.stdout);

//remove network to test it
stream.on('end', function(){
  console.log('stream end');
});
