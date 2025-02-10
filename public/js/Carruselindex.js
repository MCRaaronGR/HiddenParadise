// Variable para rastrear el índice de la diapositiva actual.
let currentSlide = 0;

// Función para mostrar una diapositiva específica en el carrusel.
function showSlide(index) {
    // Obtiene todos los elementos con la clase 'carousel-item' (las diapositivas del carrusel).
    const slides = document.querySelectorAll('.carousel-item');
    // Obtiene todos los elementos con la clase 'indicator' (los indicadores del carrusel).
    const indicators = document.querySelectorAll('.indicator');
    
    // Si el índice es mayor o igual al número total de diapositivas, reinicia al primer slide.
    if (index >= slides.length) currentSlide = 0;
    // Si el índice es menor a 0, salta al último slide.
    else if (index < 0) currentSlide = slides.length - 1;
    // De lo contrario, establece el índice actual como el índice recibido.
    else currentSlide = index;

    // Mueve el contenedor de las diapositivas para mostrar la diapositiva actual.
    const carouselItems = document.querySelector('.carousel-items'); // Contenedor de todas las diapositivas.
    carouselItems.style.transform = `translateX(-${currentSlide * 100}%)`; // Mueve el contenedor usando transformación CSS.

    // Actualiza los indicadores visuales para reflejar la diapositiva actual.
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active'); // Elimina la clase 'active' de todos los indicadores.
        if (i === currentSlide) indicator.classList.add('active'); // Agrega la clase 'active' al indicador correspondiente.
    });
}

// Opcional: Cambia automáticamente de diapositiva cada 3 segundos.
setInterval(() => {
    showSlide(currentSlide + 1); // Muestra la siguiente diapositiva.
}, 3000); // Intervalo de 3000 ms (3 segundos).

