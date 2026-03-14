require('dotenv').config();

var express = require('express');
var socket = require('socket.io');
var cors = require('cors')

const PORT = process.env.PORT || 4000;


// App setup
var app = express();
var server = app.listen(PORT, function(){
    console.log(`listening for requests on http://localhost:${PORT}`);
});

// Static files
app.use(cors())
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    socket.on('chat', function(data){
        io.sockets.emit('chat', data);
    });

    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });
});
