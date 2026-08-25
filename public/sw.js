self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'テスト通知', {
      body: data.body || '',
      icon: '/aboutus-beans-profile/icon-192.png',
      badge: '/aboutus-beans-profile/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/aboutus-beans-profile/'));
});
