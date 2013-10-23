uwsgi-node-rpc-server
=====================

A simple uwsgi-RPC server written in node.js 

write your rpc functions
^^^^^^^^^^^^^^^^^^^^^^^^

save it as server.js (eventually change the listening port at the end)

``` js
var uwsgi = require('./uwsgi_rpcserver.js');

rpc_functions = {
        'hello': function() { return "Hello World !!!"; },
        'sum': function(x, y) { return (parseInt(x)+parseInt(y)) + '';},
};

uwsgi.listen(rpc_functions, 3000);
```

run your rpc server
^^^^^^^^^^^^^^^^^^^

``` sh
node server.js
```

call functions from your uWSGI applications
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``` py
# python
import uwsgi
uwsgi.rpc('127.0.0.1:3000', 'hello')
uwsgi.rpc('127.0.0.1:3000', 'sum', '17', '30')
```

``` pl
# perl
uwsgi::rpc('127.0.0.1:3000', 'hello')
uwsgi::rpc('127.0.0.1:3000', 'sum', '17', '30')
```
