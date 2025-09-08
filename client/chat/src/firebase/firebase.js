
// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyB2ie9OP6m9Wn7mlxmKZR2TCmgN69PHPJU",
    authDomain: "push-notification-261ea.firebaseapp.com",
    projectId: "push-notification-261ea",
    storageBucket: "push-notification-261ea.firebasestorage.app",
    messagingSenderId: "375938435622",
    appId: "1:375938435622:web:b17527c1812ef59570f4e7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
// Ask permission and get token
const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    type: "module",
});

export const requestPermission = async () => {
    console.log("Requesting permission...");
    try {
        const token = await getToken(messaging, {
            vapidKey: "BMdzMqBUdlCrgA2tmx6_c0FFzOQD9c8w7IONegTCnjTBKSQHRjTt65bZlOPoYjE1Y2DnisqXQ4eeyFUDycEn44Q",
            serviceWorkerRegistration: swRegistration,
        });
        if (token) {
            console.log("✅ FCM Token:", token);
            // Send this token to your backend (to send notifications later)
        } else {
            console.log("❌ No registration token available.");
        }
    } catch (error) {
        console.error("Error while retrieving token:", error);
    }
};

// Foreground message listener
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });






