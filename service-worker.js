// Instalar el Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    
    // Precachear recursos
    event.waitUntil(
        caches.open('task-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json',
                '/icon.png', // Asegúrate de que este archivo exista en tu directorio
                // Otros archivos que necesites cachear
            ]);
        })
    );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
    
    // Limpiar caché antiguo
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

    // Responder con recursos del caché si no hay conexión
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    console.log('Notificación Push recibida:', event);

    // Extraer datos de la notificación (puedes agregar lo que desees aquí)
    const title = event.data ? event.data.text() : '¡Nueva notificación!';
    const options = {
        body: 'Tienes una nueva tarea que agregar.',
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

    // En este caso, abrimos la página de inicio
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
