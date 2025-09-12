// import React, { useRef, useState, useEffect } from 'react';
// import { io } from 'socket.io-client';


// const SIGNALING_SERVER_URL = 'http://192.168.80.118:4000/';
// const ICE_SERVERS = {
//     iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' }
//         // Add TURN servers here for production
//     ]
// };


// export default function CallPage() {
//     const [socket, setSocket] = useState(null);
//     const [userId, setUserId] = useState('');
//     const [targetId, setTargetId] = useState('');
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const pcRef = useRef(null);
//     const localStreamRef = useRef(null);

//     useEffect(() => {
//         const s = io(SIGNALING_SERVER_URL);
//         setSocket(s);
//         return () => s.close();
//     }, []);

//     useEffect(() => {
//         if (!socket) return; //  prevent running with null
//         socket.on('incoming-call', async ({ fromUserId, offer }) => {
//             const accept = window.confirm(`Incoming call from ${fromUserId}. Accept?`);
//             if (!accept) {
//                 socket.emit('reject-call', { toUserId: fromUserId });
//                 return;
//             }
//             await ensureLocalStream();
//             createPeerConnection();
//             await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await pcRef.current.createAnswer();
//             await pcRef.current.setLocalDescription(answer);
//             socket.emit('make-answer', { toUserId: fromUserId, answer });
//         });


//         socket.on('call-answered', async ({ fromUserId, answer }) => {
//             if (!pcRef.current) return;
//             await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//         });


//         socket.on('ice-candidate', async ({ fromUserId, candidate }) => {
//             try {
//                 if (pcRef.current && candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//             } catch (err) {
//                 console.error('Error adding received ICE candidate', err);
//             }
//         });


//         socket.on('user-unavailable', ({ toUserId }) => {
//             alert(`User ${toUserId} is not available`);
//         });


//         socket.on('call-rejected', ({ fromUserId }) => {
//             alert('Call rejected');
//             cleanup();
//         });


//         socket.on('call-ended', ({ fromUserId }) => {
//             alert('Call ended');
//             cleanup();
//         });


//         return () => {
//             socket.off('incoming-call');
//             socket.off('call-answered');
//             socket.off('ice-candidate');
//         };
//     }, [socket]);


//     // async function ensureLocalStream() {
//     //     if (localStreamRef.current) return;
//     //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     //     localStreamRef.current = stream;
//     //     if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//     // }

//     async function ensureLocalStream() {
//         if (localStreamRef.current) return;

//         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//             alert("getUserMedia is not supported in this browser or insecure context (use HTTPS).");
//             return;
//         }

//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         localStreamRef.current = stream;
//         if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//     }



//     function createPeerConnection() {
//         pcRef.current = new RTCPeerConnection(ICE_SERVERS);


//         // send ICE candidates to remote via signalling
//         pcRef.current.onicecandidate = e => {
//             if (e.candidate && socket && targetId) {
//                 socket.emit('ice-candidate', { toUserId: targetId, candidate: e.candidate });
//             }
//         };


//         // when remote track arrives
//         pcRef.current.ontrack = e => {
//             if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
//         };


//         // add local tracks
//         localStreamRef.current && localStreamRef.current.getTracks().forEach(track => pcRef.current.addTrack(track, localStreamRef.current));
//     }

//     async function handleCall() {
//         if (!socket) return alert('Not connected to signalling server');
//         if (!userId) return alert('Set your user ID and click Register');
//         if (!targetId) return alert('Enter target user ID');


//         await ensureLocalStream();
//         createPeerConnection();


//         const offer = await pcRef.current.createOffer();
//         await pcRef.current.setLocalDescription(offer);


//         socket.emit('call-user', { toUserId: targetId, offer, fromUserId: userId });
//     }


//     async function handleRegister() {
//         if (!socket) return;
//         if (!userId) return alert('Enter a user id');
//         socket.emit('register', { userId });
//         alert('Registered as ' + userId);
//     }


//     function cleanup() {
//         if (pcRef.current) {
//             pcRef.current.close();
//             pcRef.current = null;
//         }
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//         // keep local stream active so user can call again; if you want to stop:
//         // localStreamRef.current && localStreamRef.current.getTracks().forEach(t => t.stop());
//     }

//     function handleHangup() {
//         if (socket && targetId) socket.emit('end-call', { toUserId: targetId });
//         cleanup();
//     }


//     return (
//         <div>
//             <div>
//                 <input placeholder="your user id" value={userId} onChange={e => setUserId(e.target.value)} />
//                 <button onClick={handleRegister}>Register</button>
//             </div>
//             <div>
//                 <input placeholder="target user id" value={targetId} onChange={e => setTargetId(e.target.value)} />
//                 <button onClick={handleCall}>Call</button>
//                 <button onClick={handleHangup}>Hang up</button>
//             </div>


//             <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
//                 <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 300, height: 225, background: '#000' }} />
//                 <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, height: 225, background: '#000' }} />
//             </div>
//         </div>
//     );
// }








import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function CallPage() {
    const [peerId, setPeerId] = useState("");
    const [remoteId, setRemoteId] = useState("");
    const [peer, setPeer] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        // const newPeer = new Peer(undefined, {
        //     host: "192.168.80.118", // your backend IP
        //     port: 9000,
        //     path: "/peerjs",
        //     config: {
        //         iceServers: [
        //             { urls: "stun:stun.l.google.com:19302" },  // free Google STUN
        //             // {
        //             //     urls: "turn:openrelay.metered.ca:80",    // free public TURN
        //             //     username: "openrelayproject",
        //             //     credential: "openrelayproject"
        //             // }
        //         ],

        //     }
        // });

        const newPeer = new Peer(undefined, {
            host: "razorpay-p2yw.onrender.com",
            secure: true,
            port: 443,
            path: "/peerjs",
            config: {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    }
                ]
            }
        });

        newPeer.on("open", (id) => {
            console.log("My peer ID is:", id);
            setPeerId(id);
        });

        newPeer.on("call", async (call) => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            call.answer(stream);

            call.on("stream", (remoteStream) => {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            });
        });

        setPeer(newPeer);
    }, []);

    const callUser = async () => {
        if (!remoteId || !peer) return alert("Enter remote peer ID");

        try {
            // get local video/audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;

            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            // call the remote peer
            const call = peer.call(remoteId, stream);

            call.on("stream", (remoteStream) => {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            });
        } catch (err) {
            console.error("Failed to get local stream", err);
        }
    };


    return (
        <div>
            <h2>PeerJS Video Call</h2>
            <p>Your ID: {peerId}</p>

            <input
                type="text"
                placeholder="Enter remote ID"
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
            />
            <button onClick={callUser}>Call</button>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <video ref={localVideoRef} autoPlay muted playsInline width="300" />
                <video ref={remoteVideoRef} autoPlay playsInline width="300" />
            </div>
        </div>
    );
}
