var tap = require('tap');
var levelweb = require('./index');
var http = require('http');
var level = require('level');
var xtend = require('xtend');
var test = tap.test;

var db = level('./db', { valueEncoding: 'json' });
var server = http.createServer(levelweb(db)).listen(8089);

var options = {
  hostname: 'localhost',
  port: 8089,
  path: '',
  method: 'GET'
};

test('test api', function(t) {

  test('put some dummy data in', function(t) {

    db.batch(
      [
        { type: 'put', key: 'test1key', value: 'test1value' },
        { type: 'put', key: 'test2key', value: 'test2value' },
        { type: 'put', key: 'test3key', value: 'test3value' },
        { type: 'put', key: 'test4key', value: 'test4value' },
        { type: 'put', key: 'test5key', value: 'test5value' },
        { type: 'put', key: 'test6key', value: 'test6value' },
        { type: 'put', key: 'test7key', value: 'test7value' },
        { type: 'put', key: 'test8key', value: 'test8value' },
        { type: 'put', key: 'test10key', value: { some: 'json'} }
      ],
      function(err) {
        t.ok(!err);
        t.end();
      }
    );
  });

  test('PUT', function(t) {

    var r = xtend(options, { method: 'PUT', path: '/test9key' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 200);

      res.on('data', function() {
        db.get('test9key', function(err, value) {
          t.ok(!err);
          t.equal(value, 'test9value');
          t.end();
        });
      });

    });

    req.on('error', function(e) {
      t.fail(e);
    });

    req.write('test9value');
    req.end();
  });

  test('GET STRING', function(t) {

    var r = xtend(options, { method: 'GET', path: '/test1key' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 200);

      res.on('data', function(value) {
        t.equal(value.toString(), 'test1value');
        t.end();
      });
    });

    req.on('error', function(e) {
      t.fail(e);
    });
    req.end();
  });
  
  test('GET JSON', function(t) {
    var r = xtend(options, { method: 'GET', path: '/test10key' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 200);

      res.on('data', function(value) {
        t.equal(value.toString(), JSON.stringify({some: 'json'}));
        t.end();
      });
    });

    req.on('error', function(e) {
      t.fail(e);
    });
    req.end();
  })

  test('DELETE', function(t) {

    var r = xtend(options, { method: 'DELETE', path: '/test9key' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 200);

      res.on('data', function() {
        db.get('test9key', function(err, value) {
          t.ok(err);
          t.end();
        });
      });
    });

    req.on('error', function(e) {
      t.fail(e);
    });
    req.end();
  });

  test('GET (a value that does not exist)', function(t) {

    var r = xtend(options, { method: 'GET', path: '/test9key' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 404);

      res.on('data', function(value) {
        t.equal(value.toString(), 'Key not found in database [test9key]');
        t.end();
      });
    });

    req.on('error', function(e) {
      t.fail(e);
    });
    req.end();
  });

  test('CREATE READ STREAM', function(t) {

    var r = xtend(options, { method: 'GET', path: '/?gte=test2&lte=test6&limit=3&reverse=true' });
    var req = http.request(r, function(res) {

      t.equal(res.statusCode, 200);
      var count = 0;

      res.on('data', function(data) {
        ++count;
      });

      res.on('end', function() {
        t.equal(count, 3);
        t.end();
      });
 
    });

    req.on('error', function(e) {
      t.fail(e);
    });

    req.end();
  });

  test('teardown', function(t) {
    server.close();
    t.end();
  });
  t.end();
});

