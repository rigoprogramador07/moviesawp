// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => {
            console.log('Service Worker registrado:', reg);

            // Después de registrar el Service Worker, intentar obtener la suscripción para Push Notifications
            reg.pushManager.getSubscription()
                .then((subscription) => {
                    if (!subscription) {
                        // Clave pública de FCM (asegúrate de reemplazar con la clave correcta)
                        const applicationServerKey = 'BOKcIx93kERD-d3-rB0nS-3tRSYxYmXzdeOWa8gH7EU5TvpDMW2gRg44IwrriSVe3LFwuS6UeOMDA0_Oiop0Pmg';

                        // Suscribir al cliente para Push Notifications
                        reg.pushManager.subscribe({
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
} else {
    console.error('Service Workers no son soportados en este navegador.');
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

// Manejo de la interfaz de películas
document.getElementById('movie-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const movieInput = document.getElementById('movie-input');
    const movie = movieInput.value;

    if (movie) {
        // Agregar película a la lista
        const movieList = document.getElementById('movie-list');
        const listItem = document.createElement('li');
        listItem.textContent = movie;
        movieList.appendChild(listItem);

        // Limpiar campo de entrada
        movieInput.value = '';

        // Mostrar alerta
        alert('¡Película agregada a la lista!');

        // Verificar si el navegador soporta notificaciones
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                // Si ya se tiene permiso, muestra una notificación
                new Notification('Nueva película agregada', { body: movie });
            } else if (Notification.permission !== 'denied') {
                // Si no se ha dado permiso, lo solicitamos
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification('Nueva película agregada', { body: movie });
                    }
                });
            }
        }
    }
});

// Función para habilitar las notificaciones push
document.getElementById('enable-notifications').addEventListener('click', () => {
    if ('Notification' in window) {
        // Verificar si el permiso ya ha sido concedido
        if (Notification.permission === 'granted') {
            alert('Las notificaciones ya están habilitadas.');
        } else {
            // Solicitar permiso para mostrar notificaciones
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    alert('Notificaciones habilitadas.');
                } else {
                    alert('No se han habilitado las notificaciones.');
                }
            });
        }
    } else {
        alert('Este navegador no soporta notificaciones.');
    }
});
