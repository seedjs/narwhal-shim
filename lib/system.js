// Compatibility layer with narwhal

/*globals process */

var Co = require('seed:private/co');

exports.args = process.argv.slice(1);
exports.env  = process.env;

var stdio = {
  
  read: Co.once(function(done) {
    var buf = [];
    
    process.stdio.addListener('data', function(dta) { 
      buf.push(dta); 
    });
    
    process.stdio.addListener('close', function() {
      return done(null, buf.join(''));
    });
    
    process.stdio.open();

  }),
  
  write: function(data, done) {
    process.stdio.write(data);
    return done();
  }
};

exports.fs = {
  basename: Co.path.basename,
  
  write: function(path, content) {
    Co.fs.writeFileSync(path, content);
  },
  
  read: function(path) {
    return Co.fs.readFileSync(path);
  }
    
};

exports.stdin = {
  
  read: function() {
    return Co.wait(function(done) {
      stdio.read(done); 
    });
  }
};

exports.stdout = {
  write: function(content) {
    return Co.wait(function(done) {
      stdio.write(content, done);
    });
  }
};

exports.stdout.write.flush = function() {}; // ignore


exports.print = require('sys').print;

