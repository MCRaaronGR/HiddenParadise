// Variable para rastrear la posición actual del carrusel.
let currentIndex = 0;

// Selecciona todos los elementos con la clase 'carousel-item' (cada sección de 3 imágenes).
const items = document.querySelectorAll('.carousel-item');
// Calcula el número total de secciones de imágenes en el carrusel.
const totalItems = items.length;
// Selecciona el contenedor principal del carrusel.
const carouselContainer = document.querySelector('.carousel-container');

// Función para mover el carrusel en la dirección especificada.
function moveCarousel(direction) {
    // Actualiza el índice actual sumando la dirección (1 para adelante, -1 para atrás).
    currentIndex += direction;

    // Si el índice supera el total de elementos, vuelve al inicio del carrusel.
    if (currentIndex >= totalItems) {
        currentIndex = 0;
    } 
    // Si el índice es menor a 0, salta al último elemento del carrusel.
    else if (currentIndex < 0) {
        currentIndex = totalItems - 1;
    }

    // Mueve el contenedor del carrusel utilizando una transformación CSS.
    // Cada sección ocupa el 33.333% del ancho del contenedor.
    carouselContainer.style.transform = `translateX(-${currentIndex * 33.333}%)`;
}

// Agrega un evento al botón "siguiente" para mover el carrusel hacia adelante.
document.getElementById('nextBtn').addEventListener('click', () => moveCarousel(1));

// Agrega un evento al botón "anterior" para mover el carrusel hacia atrás.
document.getElementById('prevBtn').addEventListener('click', () => moveCarousel(-1));
