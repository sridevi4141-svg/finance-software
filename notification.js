import { app, db } from "./firebase-config.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const messaging = getMessaging(app);


// =====================================
// FCM SETUP
// =====================================

export async function setupNotifications() {

    try {

        // Ask notification permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied");
            alert("Notifications permission denied.");
            return;
        }

        console.log("Notification permission granted.");


        const registration =
    await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    );

console.log("Service Worker registered:", registration);


// Wait until Service Worker becomes active
await navigator.serviceWorker.ready;

console.log("Service Worker is active.");


// Get FCM Token
const token = await getToken(messaging, {
    vapidKey: "BMiDO_CguYvNfp44IcZ1FtqnSGKXMeG0_6iRHfOTwn071RUZ0PUHr0dHjjjL1z_ZdOIfL4EN8FtROjPY8eseBVA",
    serviceWorkerRegistration: registration
});


        if (!token) {
            console.log("FCM token not available.");
            alert("FCM Token generate కాలేదు.");
            return;
        }


        console.log("FCM Token:", token);


        // Save token to Firestore
        await addDoc(collection(db, "managerDevices"), {

            token: token,

            device: "Manager Browser",

            createdAt: serverTimestamp()

        });


        console.log("FCM Token saved to Firebase.");

        alert("✅ Manager Notifications Enabled Successfully!");

    } catch (error) {

        console.error(
            "FCM Setup Error:",
            error
        );

        alert(
            "Notification setup failed. Console చూడండి."
        );
    }
}


// =====================================
// FOREGROUND MESSAGE
// =====================================

onMessage(messaging, (payload) => {

    console.log(
        "Foreground notification:",
        payload
    );

    const title =
        payload.notification?.title ||
        "Finance Software";

    const body =
        payload.notification?.body ||
        "New notification";

    alert(
        "🔔 " + title + "\n\n" + body
    );

});const notificationBtn =
    document.getElementById("enableNotificationsBtn");

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        setupNotifications
    );

}