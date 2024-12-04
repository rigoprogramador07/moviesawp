// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
        });
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

        // Prueba para enviar notificación de forma opcional
        // Solo se enviará si el navegador soporta notificaciones
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('¡Nueva tarea añadida!', {
                        body: '¡Recuerda verificar tu lista!',
                        icon: 'icon.png' // Asegúrate de que tienes este archivo en el directorio adecuado
                    });
                } else {
                    console.log('Permiso de notificaciones denegado.');
                }
            }).catch(error => {
                console.error('Error al solicitar permisos:', error);
            });
        }
    }
});
