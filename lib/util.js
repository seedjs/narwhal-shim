/*globals process */

exports.copy = process.mixin;

// fake it til you make it
Object.freeze = function(obj) {
  return obj;
};
