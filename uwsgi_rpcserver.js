net = require('net');

exports.listen = function(rpc_functions, port) {
	net.createServer(function (socket) {

		socket.uwsgi = new Buffer(0);
		// parse the uwsgi request
		socket.on('data', function(data) {
			socket.uwsgi = Buffer.concat([socket.uwsgi, data]);
			if (call_rpc() == -1) socket.destroy();
		});

		function call_rpc() {
			if (socket.uwsgi.length >= 4) {
				var modifier1 = socket.uwsgi.readUInt8(0);
				var pktsize = socket.uwsgi.readUInt16LE(1);
				var modifier2 = socket.uwsgi.readUInt8(3);

				if (socket.uwsgi.length - 4 < pktsize) return 0;
				var args = new Array();
				// here we parse the uwsgi packet
				for(var i=0;i<pktsize;i++) {
					item_len = socket.uwsgi.readUInt16LE(4 + i);
                                	var base = 4 + i + 2;
					var item = socket.uwsgi.toString('utf8', base, base + item_len);
					args.push(item);
					i += 1 + item_len;
				}

				// check if the functions is defined
				if (args.length == 0) return -1;
				if (!(args[0] in rpc_functions)) return -1;

				var func_name = args.shift();
				var value = rpc_functions[func_name].apply(this, args);
				// build the response packet
				// 64bit version
				if (value.length > 65535) {
					var str_length = '' + value.length;
					var content_length = 'CONTENT_LENGTH';
					var dict_length = 2 + content_length.length + 2 + str_length.length;
					var response = new Buffer(4 + dict_length);
					response.writeUInt8(173, 0);
					response.writeUInt16LE(dict_length, 1);	
					response.writeUInt8(5, 3);
					response.writeUInt16LE(content_length.length, 4)
					response.write(content_length, 6)
					response.writeUInt16LE(str_length.length, 6 + content_length.length)
					response.write(str_length, 6 + content_length.length + 2)
					socket.write(response, 'utf8', function() { 
						socket.write(value, 'utf8', function() { socket.destroy();});
					});
				}
				// 16bit version
				else {
					var response = new Buffer(4 + value.length);
					response.writeUInt8(173, 0);			
					response.writeUInt16LE(value.length, 1);			
					response.writeUInt8(0, 3);			
					response.write(value, 4);
					socket.write(response, 'utf8', function() { socket.destroy();});
				}
			}
			return 0;
		}

	}).listen(port);
	console.log("RPC server started...");
};
