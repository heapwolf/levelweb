# SYNOPSIS
Leveldb over `http` or `https`.

# USAGE
```js
var http = require('http');
var levelweb = require('levelweb');
var db = require('leveldb')('./db');
var opts = { prefix: '/' };

http.createServer(levelweb(db, opts)).listen(8080);
```

# HTTP API

## PUT
```bash
curl -XPOST "localhost:8080/keyname" -l "somedata"
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
curl -XPOST "localhost:8080/"
gte=users&lte=users~&limit=10&reverse=true&keys=true&valyes=true
```

