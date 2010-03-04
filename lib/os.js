/*globals process */

var Co = require('seed:co');

exports.system = function(cmd) {
  return Co.wait(function(done) {
    Co.sys.exec(cmd, done);
  });
};

exports.exit = process.exit;