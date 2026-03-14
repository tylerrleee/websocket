import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { isToxic } from './utils/toxicity_check.js';
import dotenv from 'dotenv';
import { db } from './config/firebase-config.js';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';


dotenv.config();
const PORT = process.env.PORT;

// App setup
const app = express();
const server = app.listen(PORT, function(){
    console.log(`listening for requests on http://localhost:${PORT}`);
});

app.use(cors());
app.use(express.static('public')); // access frontend


// Socket setup & pass server
const io = new Server(server);
io.on('connection', async (socket) => {
    console.log('made socket connection', socket.id);

    // Connected -> Query Collection -> Emit 10 most recent messages 
    try {
        const get_query = query(
            collection(db, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );
        const snap = await getDocs(get_query);
        const messages = [];
        snap.forEach(doc => messages.push(doc.data())); // push snapshot to empty messages
        messages.reverse();
        messages.forEach(msg => socket.emit('chat', msg)); // for loop to display recent msg

    } catch(error){
        console.error('Error fetching most recent messages: ', error)
    }

    // Receive input chat message -> Check and emit back message 
    socket.on('chat', async function(data){
        try {
            if (await isToxic(data.message)) { 
                data.message = '*****';
                console.log(`Toxic message detected from ${data.handle}: "${data.message}"`);
            }
        } catch (error) {
            console.error('Error checking toxic messages: ', error);            
        } 
        finally {
            // On message sent, save to collection
            try {
                const to_add_Message = await addDoc(collection(db, 'messages'),{
                    handle: data.handle,
                    message: data.message,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error('Error saving messages to Firestore Collection: ', error);        
            }
            data.timestamp = { seconds: Date.now() / 1000}
            io.sockets.emit('chat', data);
        }
    });

    // Show typing
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });
});