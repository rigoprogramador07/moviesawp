// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado:', registration);

            // Después de registrar el Service Worker, intentar obtener la suscripción para Push Notifications
            registration.pushManager.getSubscription()
                .then((subscription) => {
                    if (!subscription) {
                        // Clave pública de FCM (asegúrate de reemplazar con la clave correcta)
                        const applicationServerKey = 'BOKcIx93kERD-d3-rB0nS-3tRSYxYmXzdeOWa8gH7EU5TvpDMW2gRg44IwrriSVe3LFwuS6UeOMDA0_Oiop0Pmg';
                        
                        // Suscribir al cliente para Push Notifications
                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
                        }).then((subscription) => {
                            console.log('Suscripción Push:', subscription);
                        }).catch((error) => {
                            console.error('Error al suscribirse a Push Notifications:', error);
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener suscripción:', error);
                });
        })
        .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
        });
}

// Convertir la clave base64 a Uint8Array (para la suscripción de Push Notifications)
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Instalar el Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalándose...');
    event.waitUntil(
        caches.open('task-cache-v1').then((cache) => {
            return cache.addAll([
                '/', // Asegúrate de que la raíz esté incluida
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json',
                '/icon.png',
                '/lib/owlcarousel/assets/owl.carousel.min.css',
                '/lib/lightbox/css/lightbox.min.css'
            ]);
        })
    );
    self.skipWaiting(); // Fuerza la activación del SW inmediatamente
    console.log('Service Worker instalado');
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
                        return caches.delete(cacheName); // Elimina los caches viejos
                    }
                })
            );
        })
    );
    // Toma control inmediatamente de las páginas abiertas
    self.clients.claim();
    console.log('Service Worker activado y controlando clientes');
});

// Interceptar las solicitudes de red
self.addEventListener('fetch', (event) => {
    console.log('Interceptando petición a:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Devuelve la respuesta cacheada si existe
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
                    throw error; // Maneja el error adecuadamente
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
    const icon = '/icon.png'; // Asegúrate de que la ruta sea correcta
    const badge = '/icon.png';

    const options = {
        body: body,
        icon: icon,
        badge: badge,
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
        clients.openWindow('/') // Cambia la URL si necesitas abrir otra página
    );
});
