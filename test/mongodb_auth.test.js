var run = require('../');
var kill = require('kill-mongodb');
var assert = require('assert');
var mongodb = require('mongodb');
var debug = require('debug')('mongodb-runner:mongodb_cr.test');
var format = require('util').format;
var tmp = require('tmp');
var fs = require('fs');
var helper = require('./helper');
var verifyUserPassSuccess = helper.verifyUserPassSuccess;
var verifyWrongMechanismFailure = helper.verifyWrongMechanismFailure;
var verifyNoUserPassFailure = helper.verifyNoUserPassFailure;
var verifyBadUserPassFailure = helper.verifyBadUserPassFailure;
var verifyWrongDBUserPassFailure = helper.verifyWrongDBUserPassFailure;

describe('Test Spawning With MONGODB Enabled', function() {
  before(function(done) {
    kill(done);
  });

  describe('Standalone', function() {
    var opts = {
      action: 'start',
      name: 'mongodb-runner-test-standalone-mongodb',
      port: 29000,
      auth_mechanism: 'MONGODB',
      username: 'adminUser',
      password: 'adminPass'
    };
    var tmpobj = null;

    before(function(done) {
      tmpobj = tmp.dirSync({ unsafeCleanup: true });
      debug('DB Dir: ', tmpobj.name);
      opts.dbpath = tmpobj.name;
      run(opts, function(err) {
        if (err) return done(err);
        done();
      });
    });

    after(function(done) {
      opts.action = 'stop';
      run(opts, function(err) {
        if (err) return done(err);
        tmpobj.removeCallback();
        done();
      });
    });

    it('should fail inserting with bad permissions', function(done) {
      verifyNoUserPassFailure(opts.port, opts.auth_mechanism, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should fail connecting with bad credentials', function(done) {
      verifyBadUserPassFailure(opts.port, opts.auth_mechanism, 'foo', 'bar', function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should connect and insert with good credentials', function(done) {
      verifyUserPassSuccess(opts.port, opts.auth_mechanism, opts.username, opts.password, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should fail to connect with wrong auth mechanism', function(done) {
      verifyWrongMechanismFailure(opts.port, 'PLAIN', opts.username, opts.password, function(err) {
        if (err) return done(err);
        done();
      });
    });
  });

  describe('Replicaset', function() {
    var opts = {
      action: 'start',
      name: 'mongodb-runner-test-replicaset-mongodb',
      port: 32000,
      auth_mechanism: 'MONGODB',
      username: 'adminUser',
      password: 'adminPass',
      topology: 'replicaset'
    };
    var tmpDir = null;
    var tmpKeyFile = null;

    before(function(done) {
      tmpDir = tmp.dirSync({ unsafeCleanup: true });
      opts.dbpath = tmpDir.name;
      debug('DB Dir: ', tmpDir.name);

      tmpKeyFile = tmp.fileSync();
      fs.writeFileSync(tmpKeyFile.name, 'testkeyfiledata');
      debug('KeyFile: ', tmpKeyFile.name);
      opts.keyFile = tmpKeyFile.name;

      run(opts, function(err) {
        if (err) return done(err);
        done();
      });
    });

    after(function(done) {
      opts.action = 'stop';
      run(opts, function(err) {
        if (err) return done(err);
        //tmpDir.removeCallback();
        //tmpKeyFile.removeCallback();
        done();
      });
    });

    it('should fail inserting with bad permissions', function(done) {
      verifyNoUserPassFailure(opts.port, opts.auth_mechanism, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should fail connecting with bad credentials', function(done) {
      verifyBadUserPassFailure(opts.port, opts.auth_mechanism, 'foo', 'bar', function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should connect and insert with good credentials to all members of a replicaset', function(done) {
      verifyUserPassSuccess(opts.port, opts.auth_mechanism, opts.username, opts.password, function(err) {
        if (err) return done(err);
        verifyUserPassSuccess(opts.port + 1, opts.auth_mechanism, opts.username, opts.password, function(err) {
          if (err) return done(err);
          verifyUserPassSuccess(opts.port + 2, opts.auth_mechanism, opts.username, opts.password, function(err) {
            if (err) return done(err);
            done();
          });
        });
      });
    });

    it('should fail to connect with wrong auth mechanism', function(done) {
      verifyWrongMechanismFailure(opts.port, 'PLAIN', opts.username, opts.password, function(err) {
        if (err) return done(err);
        done();
      });
    });
  });

  describe('Cluster', function() {
    var opts = {
      action: 'start',
      name: 'mongodb-runner-test-cluster-mongodb',
      shardPort: 35000,
      configPort: 35100,
      port: 35200,
      shards: 3,
      mongoses: 2,
      auth_mechanism: 'MONGODB',
      username: 'adminUser',
      password: 'adminPass',
      topology: 'cluster'
    };
    var tmpDir = null;
    var tmpKeyFile = null;

    before(function(done) {
      tmpDir = tmp.dirSync({ unsafeCleanup: true });
      opts.dbpath = tmpDir.name;
      debug('DB Dir: ', tmpDir.name);

      tmpKeyFile = tmp.fileSync();
      fs.writeFileSync(tmpKeyFile.name, 'testkeyfiledata');
      debug('KeyFile: ', tmpKeyFile.name);
      opts.keyFile = tmpKeyFile.name;

      run(opts, function(err) {
        if (err) return done(err);
        done();
      });
    });

    after(function(done) {
      opts.action = 'stop';
      run(opts, function(err) {
        if (err) return done(err);
        //tmpDir.removeCallback();
        //tmpKeyFile.removeCallback();
        done();
      });
    });

    it('should fail inserting with bad permissions', function(done) {
      verifyNoUserPassFailure(opts.port, opts.auth_mechanism, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should fail connecting with bad credentials', function(done) {
      verifyBadUserPassFailure(opts.port, opts.auth_mechanism, 'foo', 'bar', function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('should connect and insert with good credentials to all mongoses', function(done) {
      verifyUserPassSuccess(opts.port, opts.auth_mechanism, opts.username, opts.password, function(err) {
        if (err) return done(err);
        verifyUserPassSuccess(opts.port + 1, opts.auth_mechanism, opts.username, opts.password, function(err) {
          if (err) return done(err);
          done();
        });
      });
    });

    it('should fail to connect with wrong auth mechanism', function(done) {
      verifyWrongMechanismFailure(opts.port, 'PLAIN', opts.username, opts.password, function(err) {
        if (err) return done(err);
        done();
      });
    });
  });
});
