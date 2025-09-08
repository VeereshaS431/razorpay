// // firebase-messaging-sw.js
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-sw.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyB2ie9OP6m9Wn7mlxmKZR2TCmgN69PHPJU",
//     authDomain: "push-notification-261ea.firebaseapp.com",
//     projectId: "push-notification-261ea",
//     storageBucket: "push-notification-261ea.firebasestorage.app",
//     messagingSenderId: "375938435622",
//     appId: "1:375938435622:web:b17527c1812ef59570f4e7"
// };

// // firebase.initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);

// onBackgroundMessage(messaging, (payload) => {
//     console.log("Background message: ", payload);
//     self.registration.showNotification(payload.notification.title, {
//         body: payload.notification.body,
//         icon: "./vite.svg", // replace with your app icon
//     });
// });



// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-sw.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyB2ie9OP6m9Wn7mlxmKZR2TCmgN69PHPJU",
//     authDomain: "push-notification-261ea.firebaseapp.com",
//     projectId: "push-notification-261ea",
//     storageBucket: "push-notification-261ea.appspot.com", 
//     messagingSenderId: "375938435622",
//     appId: "1:375938435622:web:b17527c1812ef59570f4e7"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // Handle background messages
// onBackgroundMessage(messaging, (payload) => {
//     console.log("📩 Background message received:", payload);
//     self.registration.showNotification(payload.notification.title, {
//         body: payload.notification.body,
//         icon: "/vite.svg", // ✅ ensure this path is correct
//     });
// });



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-sw.js";

const firebaseConfig = {
    apiKey: "AIzaSyB2ie9OP6m9Wn7mlxmKZR2TCmgN69PHPJU",
    authDomain: "push-notification-261ea.firebaseapp.com",
    projectId: "push-notification-261ea",
    storageBucket: "push-notification-261ea.appspot.com", // ✅ corrected
    messagingSenderId: "375938435622",
    appId: "1:375938435622:web:b17527c1812ef59570f4e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Background notifications
onBackgroundMessage(messaging, (payload) => {
    console.log("📩 Background message:", payload);

    const notificationTitle = payload.notification?.title || "Notification";
    const notificationOptions = {
        body: payload.notification?.body || "",
        icon: "/vite.svg", // ✅ your app icon
        // data: {
        //   link: payload?.fcmOptions?.link,   // external link (if provided by FCM)
        //   path: payload?.data?.path          // internal app path (custom data)
        // }
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    console.log("Notification click event:", event);

    event.notification.close();

    const targetPath = event.notification.data?.path || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(targetPath);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetPath);
            }
        })
    );
});
