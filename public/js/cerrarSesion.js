// Selecciona el botón de cerrar sesión
const logoutButton = document.getElementById('CerraSesion');

// Escucha el evento de clic en el botón
logoutButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');  // Recuperar el token almacenado en el almacenamiento local

    try {
        // Realiza la solicitud de cierre de sesión al servidor
        const response = await fetch('/logout', {
            method: 'POST',  // Método POST para cerrar sesión
            headers: {
                'Content-Type': 'application/json',  // Tipo de contenido de la solicitud
                'Authorization': `Bearer ${token}`  // Enviar el token para autorización
            },
        });

        const result = await response.json();  // Parsear la respuesta del servidor
        alert(result.loggedOut ? 'Sesión cerrada con éxito' : 'Error al cerrar sesión');  // Mostrar mensaje según el resultado

        if (result.loggedOut) {
            // Eliminar el token del almacenamiento local si la sesión se cerró correctamente
            localStorage.removeItem('token');

            // Recargar la página o redirigir al usuario después de cerrar la sesión
            location.reload();
        }
    } catch (error) {
        alert('Error al cerrar sesión.');  // Mostrar mensaje de error si algo falla
    }
});

