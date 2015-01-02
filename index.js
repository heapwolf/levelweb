var paramify = require('paramify');
var through = require('through2').obj;
var url = require('url');
var qs = require('querystring');

module.exports = function(db, opts) {

  if (!db) {
    throw new Error('database required');
  }

  opts = opts || { prefix: '' };

  return function(req, res) {
    var u = url.parse(req.url);
    var q = qs.parse(u.query);
    var match = paramify(u.pathname + (u.hash!=null ? u.hash : ''));

    function end(err, value) {
      if (err) {
        res.statusCode = err.notFound ? 404 : 500;
        return res.end(err.message);
      }

      if (db.options.valueEncoding == 'json' && typeof(value) == "object")
        value = JSON.stringify(value);

      res.statusCode = 200;
      !!value ? res.end(value) : res.end('\0');
    }

    if (!match('/') && match(opts.prefix + ':key')) {

      if (req.method == 'GET') {
        db.get(match.params.key, end);
      }
      else if (req.method == 'DELETE') {
        db.del(match.params.key, end);
      }
      else if (req.method == 'POST' || req.method == 'PUT') {
        var body = '';
        req.on('data', function(data) {
          body += data;
        })
        .on('end', function() {
          db.put(match.params.key, body, end);
        });
      }
    }
    else if (match(opts.prefix)) {
      if (q.limit) q.limit = parseInt(q.limit, 10);
      if (q.keys) q.keys = q.keys == 'true';
      if (q.values) q.values = q.values == 'true';

      if (q.live == "true") {
        if (typeof(db.createLiveStream) != "function") {
          res.statusCode = 501;
          return res.end();
        }

        q.tail = (q.tail == "true") ? true : false;
        q.old  = (q.old == "true") ? true : false;

        res.setTimeout(0);

        db.createLiveStream(q)
          .pipe(through(function(chunk, enc, callback) {
            if (q.keys &&
                q.keys == 'false' &&
                db.options.valueEncoding != 'json') {
              this.push(chunk + '\n');
            }
            else {
              this.push(JSON.stringify(chunk) + '\n');
            }
            callback();
          })).pipe(res);
      }
      else {

        db.createReadStream(q)
          .pipe(through(function(chunk, enc, callback) {

            //
            // if the user just wants values, and the
            // encoding is not json, just return the value
            // without tryin to stringify it.
            //
            if (q.keys &&
                q.keys == 'false' &&
                db.options.valueEncoding != 'json') {
              this.push(chunk + '\n');
            }
            else {
              this.push(JSON.stringify(chunk) + '\n');
            }
            callback();
          })).pipe(res);
      
      }
    }
    else {
      res.statusCode = 404;
      res.end();
    }
  };
};
