// Manejo de las peticiones de red
self.addEventListener('fetch', (event) => {
    console.log('Interceptando petición a:', event.request.url);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Devuelve la respuesta cacheada si existe
            }

            return fetch(event.request).then((response) => {
                // Verificar si la respuesta es válida antes de guardarla en caché
                if (response && response.status === 200 && response.type === 'basic') {
                    caches.open('task-cache-v1').then((cache) => {
                        cache.put(event.request, response.clone()); // Guarda la respuesta en caché
                    });
                }
                return response; // Devuelve la respuesta de la red
            }).catch((error) => {
                console.error('Error al hacer la solicitud:', error);

                // Si no hay conexión, puedes devolver un archivo de respaldo o una respuesta predeterminada.
                // Ejemplo: una página estática de error o el último estado conocido.
                return caches.match('/offline.html'); // Asegúrate de tener un archivo offline.html si quieres manejarlo así.
            });
        })
    );
});

// Manejo de notificaciones Push (si las necesitas)
self.addEventListener('push', (event) => {
    console.log('Notificación Push recibida:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificación';
    const body = data.body || '¡Tienes una nueva tarea!';
    const icon = '/icon.png'; 
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
