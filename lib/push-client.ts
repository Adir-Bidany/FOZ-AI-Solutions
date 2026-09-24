export async function registerAndSubscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error("Push notifications are not supported by this browser.");
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
            throw new Error("VAPID public key is missing from environment variables.");
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // Send the subscription to our backend
        const res = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to save subscription on the server.");
        }

        return true;
    } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        throw error;
    }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
