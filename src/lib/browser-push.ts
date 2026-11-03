export async function enableBrowserPush() {
  if (window.top !== window.self) return { status: "open-in-new-tab" as const };
  const appId = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID;
  const vapidKey = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY;
  const config = {
    apiKey: import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY,
    projectId: import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID,
    appId, messagingSenderId: appId?.split(":")[1] ?? "",
  };
  if (!config.apiKey || !config.projectId || !appId || !vapidKey || !config.messagingSenderId) return { status: "not-configured" as const };
  if (!("Notification" in window)) return { status: "unsupported" as const };
  // Request permission immediately from the user's click, before loading the SDK.
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" as const };
  const [{ initializeApp, getApps }, { getMessaging, getToken, isSupported, onMessage }] = await Promise.all([import("firebase/app"), import("firebase/messaging")]);
  if (!(await isSupported())) return { status: "unsupported" as const };
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(config)}`, { scope: "/firebase-push/" });
  const app = getApps().find((a) => a.name === "order-push") ?? initializeApp(config, "order-push");
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  const stop = onMessage(messaging, (payload) => {
    const data = payload.data;
    if (data) void registration.showNotification(data.title || "Msosi Fasta", { body: data.body, tag: data.eventKey, icon: "/android-chrome-192x192.png", data: { path: data.path } });
  });
  return token ? { status: "registered" as const, token, stop } : { status: "denied" as const };
}