// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado:', registration);

            // Suscribimos al Service Worker para recibir notificaciones push
            return registration.pushManager.getSubscription()
                .then((subscription) => {
                    if (!subscription) {
                        // Clave pública de FCM (asegúrate de reemplazar con la clave correcta)
                        const applicationServerKey = 
                            'BOKcIx93kERD-d3-rB0nS-3tRSYxYmXzdeOWa8gH7EU5TvpDMW2gRg44IwrriSVe3LFwuS6UeOMDA0_Oiop0Pmg';

                        // Suscribir al cliente
                        return registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                        });
                    }
                    return subscription; // Ya está suscrito
                })
                .then((subscription) => {
                    console.log('Suscripción Push:', subscription);

                    // Extraer el endpoint y el token
                    const token = subscription.endpoint.split('/').pop(); 
                    console.log('Token FCM:', token);

                    // Aquí puedes enviar el token a tu backend si es necesario
                });
        })
        .catch((error) => {
            console.error('Error al registrar el Service Worker o Push Notifications:', error);
        });
} else {
    console.error('Service Workers no son soportados en este navegador.');
}

// Convertir clave base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Maneja el formulario de tareas
document.getElementById('task-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const taskInput = document.getElementById('task-input');
    const task = taskInput.value;

    if (task) {
        // Agregar tarea a la lista de tareas
        const taskList = document.getElementById('task-list');
        const listItem = document.createElement('li');
        listItem.textContent = task;
        taskList.appendChild(listItem);

        // Limpiar campo de entrada
        taskInput.value = '';

        // Mostrar alerta
        alert('¡Nuevo registro agregado!');

        // Verificar si el navegador soporta notificaciones
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                // Si ya se tiene permiso, muestra una notificación
                new Notification('Nueva tarea agregada', { body: task });
            } else if (Notification.permission !== 'denied') {
                // Si no se ha dado permiso, lo solicitamos
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification('Nueva tarea agregada', { body: task });
                    }
                });
            }
        }
    }
});
