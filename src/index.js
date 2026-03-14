import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { isToxic } from './utils/toxicity_check.js';
import dotenv from 'dotenv';
import './config/firebase-config.js';

dotenv.config();
const PORT = process.env.PORT;

// App setup
const app = express();
const server = app.listen(PORT, function(){
    console.log(`listening for requests on http://localhost:${PORT}`);
});

// Static files
app.use(cors());
app.use(express.static('public'));

// Socket setup & pass server
const io = new Server(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    socket.on('chat', async function(data){
        try {
            if (await isToxic(data.message)) { 
                data.message = '*****';
                console.log(`Toxic message detected from ${data.handle}: "${data.message}"`);
            }
        } catch (error) {
            console.error(error);            
        } 
        finally {
            io.sockets.emit('chat', data);
        }
    });

    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });
});