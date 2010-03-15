/*globals process */

var Co = require('seed:private/co');

exports.system = function(cmd) {
  return Co.wait(function(done) {
    Co.sys.exec(cmd, done);
  });
};

/**
 * enquotes a string such that it is guaranteed to be a single
 * argument with no interpolated values for a shell.
 */
exports.enquote = function (word) {
    return "'" + String(word).replace(/'/g, "'\"'\"'") + "'";
};

exports.exit = process.exit;