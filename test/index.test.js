var run = require('../');

describe('run', function() {
  it('should start a standalone', function(done) {
    var opts = {
      action: 'start',
      name: 'mongodb-runner-test-standalone',
      port: 27001
    };

    run(opts, function(err) {
      if (err) return done(err);

      opts.action = 'stop';
      run(opts, function(err) {
        if (err) return done(err);
        done();
      });
    });
  });
});