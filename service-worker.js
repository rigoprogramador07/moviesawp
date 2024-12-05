// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    // Registra el Service Worker
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
        });
}

// Instalar el Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    event.waitUntil(
        caches.open('task-cache-v1').then((cache) => {
            return cache.addAll([
                '/', // Asegúrate de que la raíz esté incluida para que funcione en cualquier ruta
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
            return fetch(event.request)
                .then((response) => {
                    // Verifica si la respuesta es válida antes de cachearla
                    if (response && response.status === 200 && response.type === 'basic') {
                        caches.open('task-cache-v1').then((cache) => {
                            cache.put(event.request, response.clone());
                        });
                    }
                    return response;
                })
                .catch((error) => {
                    console.error('Error al hacer la solicitud:', error);
                    throw error; // Enviar el error para que se maneje correctamente en la UI
                });
        })
    );
});

// Manejo de notificaciones push (FCM)
self.addEventListener('push', (event) => {
    console.log('Notificación Push recibida:', event);

    const data = event.data ? event.data.json() : {};

    const title = data.title || 'Notificación';
    const body = data.body || '¡Tienes una nueva tarea!';
    
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
        clients.openWindow('/')
    );
});
