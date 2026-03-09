const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function main(){
    // open database file
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    });

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
        connectionStateRecovery: {}
    });

    // Static files
    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, './public/index.html'));
    });

    // Make new connection w/ new user
    io.on('connection', async (socket) => {
        socket.broadcast.emit('hi');
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
                // TODO Handle failure
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
    server.listen(4000, () => {
        console.log('server runnign at http://localhost:4000');
    });
}

main();