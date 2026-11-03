importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Keep this worker on its own scope; it never caches the application shell.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.path || '/admin', self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil(clients.openWindow(target.href));
});
firebase.initializeApp(Object.fromEntries(new URL(self.location).searchParams));
firebase.messaging().onBackgroundMessage((payload) => {
  const data = payload.data || {};
  return self.registration.showNotification(data.title || 'Msosi Fasta', {
    body: data.body || 'Oda mpya imeingia.', icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png', tag: data.eventKey, data: { path: data.path || '/admin' },
  });
});