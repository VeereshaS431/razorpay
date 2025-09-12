// // server/server.js
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');


// const app = express();
// const server = http.createServer(app);


// const io = new Server(server, {
//     cors: { origin: '*' }
// });


// // Map userId -> socketId (in-memory). Replace with a persistent store/auth mapping in prod.
// const userSocketMap = new Map();



// io.on('connection', socket => {
//     console.log('socket connected', socket.id);


//     // client registers with a userId after connecting
//     socket.on('register', ({ userId }) => {
//         userSocketMap.set(userId, socket.id);
//         socket.userId = userId;
//         console.log('registered', userId, '->', socket.id);
//     });


//     // Caller initiates call: send offer to callee's socket
//     socket.on('call-user', ({ toUserId, offer, fromUserId }) => {
//         const toSocket = userSocketMap.get(toUserId);
//         if (toSocket) {
//             io.to(toSocket).emit('incoming-call', { fromUserId, offer });
//         } else {
//             socket.emit('user-unavailable', { toUserId });
//         }
//     });


//     // Callee sends answer back
//     socket.on('make-answer', ({ toUserId, answer }) => {
//         const toSocket = userSocketMap.get(toUserId);
//         if (toSocket) io.to(toSocket).emit('call-answered', { fromUserId: socket.userId, answer });
//     });


//     // ICE candidates (both directions)
//     socket.on('ice-candidate', ({ toUserId, candidate }) => {
//         const toSocket = userSocketMap.get(toUserId);
//         if (toSocket) io.to(toSocket).emit('ice-candidate', { fromUserId: socket.userId, candidate });
//     });


//     socket.on('reject-call', ({ toUserId }) => {
//         const toSocket = userSocketMap.get(toUserId);
//         if (toSocket) io.to(toSocket).emit('call-rejected', { fromUserId: socket.userId });
//     });


//     socket.on('end-call', ({ toUserId }) => {
//         const toSocket = userSocketMap.get(toUserId);
//         if (toSocket) io.to(toSocket).emit('call-ended', { fromUserId: socket.userId });
//     });


//     socket.on('disconnect', () => {
//         if (socket.userId) {
//             userSocketMap.delete(socket.userId);
//             console.log('disconnected', socket.userId);
//         }
//     });
// });


// app.get("/", (req, res) => {
//     res.send("hello")
// })

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log('Signalling server listening on', PORT));











import express from "express";
import { createServer } from "http";
import { ExpressPeerServer } from "peer";

const app = express();
const server = createServer(app);

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: "/",
});


app.use("/peerjs", peerServer);


server.listen(9000, () => {
    console.log("PeerServer running at http://192.168.80.118:9000/peerjs");
});

