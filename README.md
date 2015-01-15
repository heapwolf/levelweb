# SYNOPSIS
Leveldb over `http` or `https`.

# USAGE
```js
var http = require('http');
var levelweb = require('levelweb');
var db = require('level')('./db');
var opts = { prefix: '/' };

//
// like this...
//
http.createServer(levelweb(db, opts)).listen(8080);

//
// or like this... since the levelweb() function just
// returns a function that accepts request and response 
// streams.
//
var level = levelweb(db, opts);

http.createServer(function(req, res) {
  level(req, res);
}).listen(8080);
```

# HTTP API

## PUT
```bash
curl -XPUT "localhost:8080/keyname" --data "somedata"
value
```

## GET
```bash
curl -XGET "localhost:8080/keyname"
```

## DELETE
```bash
curl -XDELETE "localhost:8080/keyname"
```

## CREATE READ STREAM
All of the options in the query string are optional.

```bash
curl -XGET "localhost:8080/?gte=users&lte=users~&limit=10&reverse=true&keys=true&valyes=true"
```

## CREATE LIVE STREAM
All of the same options from above apply to this API call

```bash
curl -XGET "localhost:8080/?tail=true&old=false&live=true"
```

## LIVE BACKUP
Get a stream of the leveldb files from a backup (only supported by `level-hyper`)

```bash
curl -XPOST "localhost:8080/"
```

