// Obtiene el elemento con el ID 'container' del DOM.
const container = document.getElementById('container');
// Obtiene el botón de registro (register) del DOM.
const registerBtn = document.getElementById('register');
// Obtiene el botón de inicio de sesión (login) del DOM.
const loginBtn = document.getElementById('login');

// Agrega un evento 'click' al botón de registro.
registerBtn.addEventListener('click', () => {
    // Añade la clase 'active' al contenedor cuando se hace clic en el botón de registro.
    container.classList.add("active");
});

// Agrega un evento 'click' al botón de inicio de sesión.
loginBtn.addEventListener('click', () => {
    // Elimina la clase 'active' del contenedor cuando se hace clic en el botón de inicio de sesión.
    container.classList.remove("active");
});
