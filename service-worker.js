// Instalar el Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    event.waitUntil(
        caches.open('task-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json',
                '/icon.png',
            ]);
        })
    );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'task-cache-v1') {
                        console.log('Cache obsoleto eliminado:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar las solicitudes de red
self.addEventListener('fetch', (event) => {
    console.log('Interceptando petición a:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Manejo de notificaciones push (FCM)
self.addEventListener('push', (event) => {
    console.log('Notificación Push recibida:', event);

    // Asegúrate de que el evento contiene datos
    const data = event.data ? event.data.json() : {};
    
    // Establecer título y cuerpo con valores predeterminados si no existen
    const title = data.title || 'Notificación';
    const body = data.body || '¡Tienes una nueva tarea!';
    
    // Opciones para la notificación
    const options = {
        body: body,
        icon: 'icon.png',
        badge: 'icon.png',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Manejar clics en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada:', event);
    event.notification.close();
    event.waitUntil(
        // Abrir la ventana principal o una URL específica
        clients.openWindow('/')
    );
});
