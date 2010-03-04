/*globals process */

var Co = require('seed:co');

exports.isDirectory = function(path) {
  return Co.wait(function(done) {
    Co.fs.stat(path, function(err, stat) {
      if (err) return done(null, false);
      else return done(null, stat.isDirectory());
    });
  });
};

exports.exists = function(path) {
  return Co.wait(function(done) {
    Co.path.exists(path, done);
  });
};

exports.mkdirs = function(path) {
  Co.wait(function(done) {
    Co.fs.mkdir_p(path, 0777, done);
  });
};

exports.rmtree = function(path) {
  Co.wait(function(done) {
    Co.fs.rm_r(path, done);
  });
};

exports.dirname = function(path) {
  return Co.path.dirname(path);
};

exports.cwd = process.cwd;

exports.join = Co.path.join;
exports.absolute = Co.path.normalize;
exports.basename = Co.path.basename;

exports.mtime = function(path) {
  return Co.wait(function(done) {
    Co.fs.stat(path, function(err, stats) {
      if (err) return done(null, -1);
      else return done(null, stats.mtime);
    });
  });
};


exports.FNM_LEADING_DIR = 1 << 1;
exports.FNM_PATHNAME    = 1 << 2;
exports.FNM_PERIOD      = 1 << 3;
exports.FNM_NOESCAPE    = 1 << 4;
exports.FNM_CASEFOLD    = 1 << 5;
exports.FNM_DOTMATCH    = 1 << 6;
exports.SEPARATOR  = '/'; // TODO: alt for windows

// ..........................................................
// fnmatch() from narwhal
// 

var fnmatchFlags = ["FNM_LEADING_DIR","FNM_PATHNAME","FNM_PERIOD","FNM_NOESCAPE","FNM_CASEFOLD","FNM_DOTMATCH"];

exports.fnmatch = function (pattern, string, flags) {
    var re = exports.patternToRegExp(pattern, flags);
    //print("PATTERN={"+pattern+"} REGEXP={"+re+"}");
    return re.test(string);
};

exports.patternToRegExp = function (pattern, flags) {
    var options = {};
    if (typeof flags === "number") {
        fnmatchFlags.forEach(function(flagName) {
            options[flagName] = !!(flags & exports[flagName]);
        });
    } else if (flags) {
        options = flags;
    }
    
    // FNM_PATHNAME: don't match separators
    var matchAny = options.FNM_PATHNAME ? "[^"+RegExp.escape(exports.SEPARATOR)+"]" : ".";
    
    // FNM_NOESCAPE match "\" separately
    var tokenizeRegex = options.FNM_NOESCAPE ? (/\[[^\]]*\]|{[^}]*}|[^\[{]*/g) : (/\\(.)|\[[^\]]*\]|{[^}]*}|[^\\\[{]*/g);
    
    return new RegExp(
        '^' + 
        pattern.replace(tokenizeRegex, function (pattern, $1) {
            // if escaping is on, always return the next character escaped
            if (!options.FNM_NOESCAPE && (/^\\/).test(pattern) && $1) {
                return RegExp.escape($1);
            }
            if (/^\[/.test(pattern)) {
                var result = "[";
                pattern = pattern.slice(1, pattern.length - 1);
                // negation
                if (/^[!^]/.test(pattern)) {
                    pattern = pattern.slice(1);
                    result += "^";
                }
                // swap any range characters that are out of order
                pattern = pattern.replace(/(.)-(.)/, function(match, a, b) {
                    return a.charCodeAt(0) > b.charCodeAt(0) ? b + "-" + a : match;
                });
                return result + pattern.split("-").map(RegExp.escape).join("-") + ']';
            }
            if (/^\{/.test(pattern))
                return (
                    '(' +
                    pattern.slice(1, pattern.length - 1)
                    .split(',').map(function (pattern) {
                        return RegExp.escape(pattern);
                    }).join('|') +
                    ')'
                );
            return pattern
            .replace(exports.SEPARATORS_RE(), exports.SEPARATOR)    
            .split(new RegExp(
                exports.SEPARATOR + "?" +
                "\\*\\*" + 
                exports.SEPARATOR + "?"
            )).map(function (pattern) {
                return pattern.split(exports.SEPARATOR).map(function (pattern) {
                    if (pattern == "")
                        return "\\.?";
                    if (pattern == ".")
                        return;
                    if (pattern == "...")
                        return "(|\\.|\\.\\.(" + exports.SEPARATOR + "\\.\\.)*?)";
                    return pattern.split('*').map(function (pattern) {
                        return pattern.split('?').map(function (pattern) {
                            return RegExp.escape(pattern);
                        }).join(matchAny);
                    }).join(matchAny + '*');
                }).join(RegExp.escape(exports.SEPARATOR));
            }).join('.*?');
        }) +
        '$',
        options.FNM_CASEFOLD ? "i" : ""
    );
};
