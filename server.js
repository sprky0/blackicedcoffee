
var connect = require('connect');
connect.createServer(connect.static(__dirname + "/docroot")).listen(8080);
