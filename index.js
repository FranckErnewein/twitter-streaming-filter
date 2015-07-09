var util = require('util');
var stream = require('stream');
var OAuth = require('oauth').OAuth;

var Parent = stream.Readable;

util.inherits(TwitterConnector, Parent);

function TwitterConnector(options) {
  this.options = options;
  this.connected = false;
  if (!options.consumer_key) {
    throw new Error('consumer_key is missing');
  }
  if (!options.consumer_secret_key) {
    throw new Error('consumer_secret_key is missing');
  }
  if (!options.track && !options.locations) {
    throw new Error('define track or/and locations');
  }
  Parent.call(this, {
    encoding: 'utf8'
  });
}

TwitterConnector.prototype._read = function() {
  if (!this.request) {
    var self = this;
    var options = this.options;
    var APIParams = {};
    ['track', 'locations', 'language'].forEach(function(key) {
      var opt = options[key];
      if(opt instanceof Array){
        APIParams[key] = opt.join();
      }else if(typeof opt === 'string'){
        APIParams[key] = opt;
      }
    });

    var oauth = new OAuth('https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      options.consumer_key,
      options.consumer_secret_key,
      '1.0A',
      null,
      'HMAC-SHA1');

    var request = this.request = oauth.post('https://stream.twitter.com/1.1/statuses/filter.json',
      options.access_token,
      options.access_token_secret,
      APIParams);
    request.addListener('response', function(response) {
      self.response = response;
      response.setEncoding('utf8');
      response.on('data', function(chunk) {
        self.push(chunk);
      });
      response.on('end', function() {
        self.push(null);
        //console.log('end', arguments);
      });
      response.on('error', function(err) {
        self.emit('error', err);
      });
    });
    request.end();
  }
};

TwitterConnector.prototype.close = function() {
  if (this.response) {
    this.response.abort();
  }
};

module.exports = TwitterConnector;
