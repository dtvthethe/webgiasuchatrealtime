var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var	mysql   = require("mysql");
var connectdb = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password:'',
	database:'giasudb'
});
connectdb.connect(function(err){
    if (err) console.log(err)
});

http.listen(9000, function () {
    console.log('Listening on Port 9000');
});
io.sockets.on('connection', function(socket){
	socket.on('join',function(data){
		var qu = 'SELECT chat.*, users.fullname, users.avatar FROM chat, users'+
			' WHERE chat.id_send = users.id AND chat.id_lop = '+data.id_lop+' ORDER BY chat.id DESC LIMIT 0,'+data.max;
		connectdb.query(qu,function(err,query){
			if(err){
				console.log(err);
				return;
			}
			io.sockets.emit('join',query);
		});
	});

	socket.on('send',function(data){
		var qu = "INSERT INTO chat(`noi_dung`, `id_lop`, `id_send`) VALUES('"+data.noi_dung+"','"+data.id_lop+"','"+data.id_send+"')";
		connectdb.query(qu,function(err,query){
			if(err){
				console.log(err);
				return;
			}
			var qu2 = 'SELECT chat.*, users.fullname, users.avatar FROM chat, users'+
			' WHERE chat.id_send = users.id AND chat.id = '+query.insertId;
			connectdb.query(qu2,function(err2,query2){
				if(err2){
					console.log(err2);
					return;
				}
				io.sockets.emit('send',query2);
			});
			
			//io.sockets.emit('join',query);
		});
	});
});