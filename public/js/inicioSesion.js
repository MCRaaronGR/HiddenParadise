document.addEventListener('DOMContentLoaded', async () => {
    // Obtiene el token de sesión almacenado en localStorage
    const token = localStorage.getItem('token');

    // Selección de los botones para control de la interfaz
    const registerButton = document.querySelector('#FormRegister button');  // Botón de registro
    const loginButton = document.querySelector('#FormInicioSesion button');  // Botón de inicio de sesión
    const closeButton = document.getElementById('CerraSesion');  // Botón para cerrar sesión

    // Si no hay token en localStorage, no hay sesión activa
    if (!token) {
        console.log('No hay sesión activa.');
        return;
    }

    try {
        // Enviar solicitud al servidor para verificar la sesión activa
        const response = await fetch('/checkSession', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await response.json();  // Parsear la respuesta del servidor

        // Si la sesión está activa
        if (result.sesionActiva) {
            console.log('Sesión activa.');

            // Deshabilitar botones de registro y login
            registerButton.style.cursor = 'not-allowed';  // Cambiar cursor y deshabilitar el botón
            registerButton.disabled = true;

            loginButton.style.cursor = 'not-allowed';  // Cambiar cursor y deshabilitar el botón
            loginButton.disabled = true;

            closeButton.style.visibility = 'visible';  // Hacer visible el botón para cerrar sesión
        } else {
            console.log('Sesión inactiva.');
            localStorage.removeItem('token');  // Eliminar token si la sesión no es válida
            closeButton.style.visibility = 'hidden';  // Ocultar el botón para cerrar sesión
        }
    } catch (error) {
        console.error('Error al verificar la sesión:', error);
    }
});


// Registro de usuario
const registerForm = document.getElementById('FormRegister');  // Obtiene el formulario de registro

// Escucha el evento de envío del formulario
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que se recargue la página al enviar el formulario

    // Obtiene los valores del formulario
    const username = document.getElementById('registerUsername').value;
    const age = document.getElementById('registerAge').value;
    const password = document.getElementById('registerPassword').value;

    try {
        // Envío de la solicitud al servidor para registrar un nuevo usuario
        const response = await fetch('/register', {
            method: 'POST',  // Método POST para registrar
            headers: { 'Content-Type': 'application/json' },  // Headers para indicar el tipo de contenido JSON
            body: JSON.stringify({ username, age, password }),  // Datos enviados al servidor en formato JSON
        });

        const result = await response.json();  // Parsear la respuesta del servidor
        alert(result.message);  // Mostrar el mensaje del servidor

        if (response.ok) {
            container.classList.remove('right-panel-active');  // Cambia el estado de la interfaz (si es necesario)
        }
    } catch (error) {
        alert('Error al registrarse.');  // Muestra un mensaje de error si algo falla
    }
});


// Selecciona el formulario de inicio de sesión
const loginForm = document.getElementById('FormInicioSesion');

// Escucha el evento de envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que se recargue la página al enviar el formulario

    // Obtiene los valores del formulario
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Envío de la solicitud al servidor para iniciar sesión
        const response = await fetch('/login', {
            method: 'POST',  // Método POST para iniciar sesión
            headers: { 'Content-Type': 'application/json' },  // Headers para indicar el tipo de contenido JSON
            body: JSON.stringify({ username, password }),  // Datos enviados al servidor en formato JSON
        });

        const result = await response.json();  // Parsear la respuesta del servidor
        alert(result.message);  // Mostrar el mensaje del servidor

        if (response.ok) {
            // Almacenar el token obtenido para futuras solicitudes
            localStorage.setItem('token', result.token);  
            location.reload();  // Recargar la página para reflejar el cambio de estado
        }
    } catch (error) {
        alert('Error al iniciar sesión.');  // Muestra un mensaje de error si algo falla
    }
});
