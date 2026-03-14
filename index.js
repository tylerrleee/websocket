<<<<<<< HEAD
require('dotenv').config();
=======
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

require('dotenv').config();
const localPORT = parseInt(process.env.PORT, 10);

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  // create one worker per available core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: localPORT + i
    });
  }
  
  // set up the adapter on the primary thread
  return setupPrimary();
}

>>>>>>> abe7c1c265318c7f541af884a8d71c415013be64

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

<<<<<<< HEAD
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });
});
=======
    // create 'messages' table 
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT 
        );
    `);

    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {},
        adapter: createAdapter() // Create a worker on each thread
    });

    // Static files
    app.use(express.static(join(__dirname, 'public')));


    // Make new connection w/ new user
    io.on('connection', async (socket) => {
        // When connected, assign an ID (e.g. UUID) -- including new users
        socket.data.username = `User_${socket.id.substring(0, 5)}`;

        // Announce that said user has joined | differentiate user msg and system msg
        // socket.broadcast.emit('chat message', `${socket.data.username} connected!`);
        socket.broadcast.emit('chat message', {
                text: `${socket.data.username} connected!`,
                type: 'system' // sent to frontend with label from backend
            });

        // Listen for new name
        socket.on('set name', (customName) => {
            const oldName = socket.data.username;
            socket.data.username = customName;
            socket.broadcast.emit('chat message', {
                text: `${oldName} changed their name to ${customName}`,
                type: 'system' 
            });
        });

        socket.on('disconnect', () => {
            // Broadcast a message to all OTHER connected users
            socket.broadcast.emit('chat message', {
                text: `${socket.data.username} has disconnected.`,
                type: 'system' // sent to frontend with label from backend
            });
        });

        socket.on('chat message', async (msg, clientOffset, callback) => {
            let result;
            try {
                // store message in db
                result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
            } catch (e) {
                if (e.errno === 19 /*SQLITE_CONSTRAINT */){
                    // msg already inserted, so notify client
                    callback();
                } else{
                    // nothing, let client retry
                }
                const formattedMsg = `${socket.data.username}: ${msg}`;


                // TODO Handle failure
                io.emit('chat message', formattedMsg, result.lastID); 
                callback();
                return;
            }
            io.emit('chat message', msg, result.lastID);
            // acknowledge event
            callback();
        });

        if (!socket.recovered) {
            // if connection state recovery not successful
            try {
                await db.each('SELECT id, content from messages WHERE id > ?',
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        socket.emit('chat message', row.content, row.id);
                    }
                )
            } catch (e) {
                // something wrong
            }
        }
    });

    // function(){} is the same as () => {}

    const port = process.env.PORT;

    server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
    });
};


main();
>>>>>>> abe7c1c265318c7f541af884a8d71c415013be64
