import React, { useEffect, useState } from 'react'
import { onMessageListener, requestPermission } from '../../firebase/firebase';

export default function PushNotification() {
    const [notification, setNotification] = useState({ title: "", body: "" });

    useEffect(() => {
        requestPermission();
        onMessageListener()
            .then((payload) => {
                setNotification({
                    title: payload.notification.title,
                    body: payload.notification.body,
                });
            })
            .catch((err) => console.log("Error receiving foreground message:", err));
    }, []);

    return (
        <>
            {/* <div style={{ padding: "20px" }}>
            <h2>Firebase Push Notification Demo</h2>
            {notification.title ? (
                <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px" }}>
                    <h3>{notification.title}</h3>
                    <p>{notification.body}</p>
                </div>
            ) : (
                <p>No notifications yet...</p>
            )}
        </div> */}
        </>
    )
}
