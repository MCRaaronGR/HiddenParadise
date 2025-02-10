document.getElementById('country-form').addEventListener('submit', async (event) => {
    event.preventDefault();  // Evitar el comportamiento por defecto del formulario

    const countryInput = document.getElementById('country-input').value;  // Obtener el valor ingresado en el campo del país
    const countryInfoDiv = document.getElementById('country-info');  // Obtener el div donde se mostrará la información del país

    countryInfoDiv.innerHTML = 'Cargando...';  // Mostrar un mensaje de carga mientras se obtienen los datos del país


    try {
        // Envía una solicitud GET al endpoint de la API con el nombre del país codificado en la URL.
        const response = await fetch(`/api/country-info?country=${encodeURIComponent(countryInput)}`);
        // Convierte la respuesta de la API en un objeto JSON.
        const data = await response.json();
    
        // Verifica si la respuesta contiene un error.
        if (data.error) {
            // Muestra el mensaje de error en el contenedor correspondiente.
            countryInfoDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        } else {
            // Si no hay error, muestra la información del país en formato HTML.
            countryInfoDiv.innerHTML = `
            <div>
                <h2>${data.name}</h2> <!-- Muestra el nombre del país. -->
                <img src="${data.flag}" alt="Bandera de ${data.name}"> <!-- Muestra la bandera del país. -->
            </div>
                <p><strong>Capital:</strong> ${data.capital}</p> <!-- Muestra la capital del país. -->
                <p><strong>Región:</strong> ${data.region}</p> <!-- Muestra la región del país. -->
                <p><strong>Subregión:</strong> ${data.subregion}</p> <!-- Muestra la subregión del país. -->
                <p><strong>Población:</strong> ${data.population.toLocaleString()}</p> <!-- Muestra la población formateada. -->
                <p><strong>Idiomas:</strong> ${data.languages}</p> <!-- Muestra los idiomas del país. -->
                <p><strong>Monedas:</strong> ${data.currencies}</p> <!-- Muestra las monedas del país. -->
            `;
            // Almacena el nombre de la capital en una variable.
            const capitalP = data.capital;
            // Llama a la función MostrarLInteres con la capital como parámetro y espera su ejecución.
            await MostrarLInteres(capitalP);
        }
    } catch (error) {
        // Maneja errores de la solicitud o de la API mostrando un mensaje genérico.
        countryInfoDiv.innerHTML = '<p>Error al obtener la información del país. Intenta más tarde.</p>';
    }
    
});

// Función asíncrona que muestra lugares de interés basados en la capital proporcionada.
async function MostrarLInteres(Capital) {
    // Muestra en la consola la capital extraída.
    console.log("Capital extraída: ", Capital);
    // Obtiene el elemento HTML donde se mostrarán los destinos turísticos.
    const destinationsDiv = document.getElementById('country-destinations');

    // Muestra un mensaje inicial mientras se cargan los datos.
    destinationsDiv.innerHTML = 'Espera, aquí están posibles destinos de aventuras';
    try {
        // Realiza una solicitud GET al endpoint de la API con la capital como parámetro en la query string.
        const response = await fetch('/api/destinations?capital=' + Capital, { 
            method: 'GET',  // Especifica que el método HTTP es GET.
            headers: { 'Content-Type': 'application/json' } // Define el tipo de contenido esperado como JSON.
        });

        // Convierte la respuesta de la API en un objeto JSON.
        const data = await response.json();
        // Muestra en la consola la respuesta obtenida de la API.
        console.log('Respuesta de la API:', data);

        // Verifica si la respuesta indica éxito.
        if (data.success) {
            // Extrae la información de viajes desde los datos de la respuesta.
            const { travelInfo } = data;

            // Renderiza la lista de destinos turísticos en el contenedor HTML.
            destinationsDiv.innerHTML = 
            ` <div class="TituloDestinosP"><h2>¡Ey!, podrías visitar los siguientes lugares en ${Capital}</h2></div>` +  
            travelInfo.map(destination => `
                <div class="DestinosSugeridosA">
                    <h3>${destination.name}</h3> <!-- Muestra el nombre del destino. -->
                    <p>${destination.description}</p> <!-- Muestra la descripción del destino. -->
                </div>
            `).join(''); // Une todos los destinos generados en una sola cadena HTML.
        } else {
            // Si la API devuelve un error, muestra el mensaje en el contenedor.
            destinationsDiv.innerHTML = `<p>Error: ${data.message}</p>`;
        }
    } catch (error) {
        // Muestra cualquier error en la consola para depuración.
        console.error('Error:', error);
    }
}


