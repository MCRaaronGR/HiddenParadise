document.addEventListener('DOMContentLoaded', () => {
    const btnHuellaCarbono = document.getElementById('BtnHuellaCarbono'); // Botón para calcular huella de carbono
    const selectCiudadOrigen = document.getElementById('Corigen'); // Select para ciudad de origen
    const selectCiudadDestino = document.getElementById('Cdestino'); // Select para ciudad de destino
    const ResultadosDiv = document.getElementById('HCR'); // Div donde se mostrarán los resultados
    let DistanciaGlobl; // Variable global para almacenar la distancia calculada

    btnHuellaCarbono.addEventListener('click', async () => { // Evento al hacer clic en el botón de huella de carbono
        
        // Obtener las ciudades seleccionadas
        const ciudadOrigen = selectCiudadOrigen.options[selectCiudadOrigen.selectedIndex]; 
        const ciudadDestino = selectCiudadDestino.options[selectCiudadDestino.selectedIndex];

        if (ciudadOrigen && ciudadDestino) { // Verificar si ambas ciudades están seleccionadas
            // Obtener latitudes y longitudes de los atributos personalizados de cada ciudad
            const lat1 = ciudadOrigen.getAttribute('latitudO'); 
            const long1 = ciudadOrigen.getAttribute('longitudO');
            const lat2 = ciudadDestino.getAttribute('latitudD');
            const long2 = ciudadDestino.getAttribute('longitudD');

            if (lat1 && long1 && lat2 && long2) { // Verificar si las coordenadas están disponibles
                try {
                    // Llamar a la API para calcular la distancia entre las dos ciudades
                    const response = await fetch('/calcularDistancia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat1, long1, lat2, long2 }) // Enviar las coordenadas en el cuerpo de la solicitud
                    });

                    if (response.ok) { // Si la respuesta es exitosa
                        const data = await response.json(); // Parsear la respuesta JSON
                        const distanciaKm = data.distance; // Obtener la distancia en km
                        DistanciaGlobl = distanciaKm; // Almacenar la distancia global
                        alert(`La distancia entre las ciudades es de ${distanciaKm} km.`); // Mostrar la distancia
                    } else {
                        alert('Error al calcular la distancia. Intenta de nuevo.'); // Error si la respuesta no es exitosa
                    }
                    
                } catch (error) {
                    alert('Hubo un error en la solicitud. Por favor, inténtalo más tarde.'); // Manejo de errores en la solicitud
                    console.error('Error en la solicitud:', error); // Mostrar error en la consola
                }
            } else {
                alert('No se pudieron obtener las coordenadas de las ciudades seleccionadas.'); // Si no se pueden obtener las coordenadas
            }
        } else {
            alert('Por favor selecciona una ciudad de origen y destino.'); // Si no se seleccionaron las ciudades
        }

        // Obtener los medios de transporte seleccionados
        const mediosSeleccionados = Array.from(document.querySelectorAll('.MediosT input:checked')).map(input => input.id.slice(1).toLowerCase());
        const distancia = DistanciaGlobl; // Usar la distancia global calculada

        if (!distancia || mediosSeleccionados.length === 0) { // Verificar si hay distancia y medios seleccionados
            alert("Por favor, selecciona al menos un medio de transporte"); // Alerta si falta información
            return;
        }

        try {
            // Llamar a la API para calcular la huella de carbono
            const response = await axios.post('http://localhost:3000/calcularHuellaCarbono', {
                distancia,
                medios: mediosSeleccionados, // Enviar los medios seleccionados
            });
            const { huellaCarbono } = response.data; // Obtener la huella de carbono desde la respuesta

            ResultadosDiv.innerHTML = ''; // Limpiar el contenedor de resultados

            if (response) { // Si la respuesta es válida
                // Mostrar los resultados de la huella de carbono
                ResultadosDiv.innerHTML = `<h3>Aquí tus resultados :D</h3>
                <br> 
                <p>Se estima que tu viaje genera una huella de carbono de ${huellaCarbono} kg de CO2</p> 
                <p>Para que te hagas una idea, los valores individuales de la huella de carbono son: </p> 
                <div style="padding: 1rem;">
                    <ol>
                        <li> <b>Baja: </b>Menos de 2 toneladas de CO₂ equivalente al año.</li>
                        <li> <b>Moderada: </b>Entre 2 y 5 toneladas de CO₂ equivalente al año.</li>
                        <li> <b>Alta: </b>Más de 5 toneladas de CO₂ equivalente al año. </li>
                    </ol>
                </div>`;
                // Clasificar la huella de carbono en baja, moderada o alta
                if (huellaCarbono <= 2000) {
                    ResultadosDiv.innerHTML += `<p>Tu aventura, según tu huella de carbono, es amigable con el medio ambiente :D. Felicidades, 
                    sigamos cuidando el planeta y tomando acciones para reducir más tu huella de carbono.</p>`;
                }
                else if (huellaCarbono <= 5000) {
                    ResultadosDiv.innerHTML += `<p>Parece que tu aventura está en el promedio. HiddenParadise te invita a tomar nuevas decisiones
                    que consideren al medio ambiente :D.</p>`;
                }
                else {
                    ResultadosDiv.innerHTML += `<p>Lamentablemente tu aventura presenta una huella de carbono alta, te invitamos a crear conciencia ambiental
                    y recordar que todas nuestras aventuras representan un impacto en el medio ambiente.</p>`;
                }
            } else {
                ResultadosDiv.innerHTML = `<p>Opps ... <br> Parece que hubo un error procesando tus resultados. <br>Inténtalo más tarde.</p>`;
            }

            alert(`La huella de carbono total es de ${huellaCarbono} kg de CO2.`); // Mostrar la huella de carbono en alerta
        } catch (error) {
            console.error("Error al conectar con el servidor:", error); // Manejo de errores en la conexión con el servidor
            alert("Hubo un error al calcular la huella de carbono. Por favor, inténtalo de nuevo."); // Alerta de error
        }

    });
});

