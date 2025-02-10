// Escucha el evento 'DOMContentLoaded' para ejecutar el código cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    // Obtiene el elemento del select para el origen.
    const selectOrigen = document.getElementById('Porigen');
    // Obtiene el elemento del select para el destino.
    const selectDestino = document.getElementById('Pdestino');

    // Realiza una solicitud al backend para obtener la lista de países.
    fetch('/leerpaises')
        .then(response => response.json()) // Convierte la respuesta en un objeto JSON.
        .then(paises => {
            // Itera sobre la lista de países obtenida.
            paises.forEach(pais => {
                // Crea una nueva opción para el select de origen.
                const option = document.createElement('option');
                option.value = pais.code; // Asigna el código del país como valor de la opción.
                option.textContent = pais.name; // Asigna el nombre del país como texto visible.
                selectOrigen.appendChild(option); // Agrega la opción al select de origen.
            });
        })
        .catch(error => {
            // Maneja y muestra errores en caso de que la solicitud falle.
            console.error('Error al cargar los países:', error);
        });

    // Realiza otra solicitud al backend para obtener la lista de países (para el select de destino).
    fetch('/leerpaises')
        .then(response => response.json()) // Convierte la respuesta en un objeto JSON.
        .then(paises2 => {
            // Itera sobre la lista de países obtenida.
            paises2.forEach(pais2 => {
                // Crea una nueva opción para el select de destino.
                const option2 = document.createElement('option');
                option2.value = pais2.code; // Asigna el código del país como valor de la opción.
                option2.textContent = pais2.name; // Asigna el nombre del país como texto visible.
                selectDestino.appendChild(option2); // Agrega la opción al select de destino.
            });
        })
        .catch(error => {
            // Maneja y muestra errores en caso de que la solicitud falle.
            console.error('Error al cargar los países:', error);
        });
});


// Escucha el evento 'DOMContentLoaded' para ejecutar el código una vez que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    // Obtiene el elemento del select de países de origen.
    const selectPais = document.getElementById('Porigen');
    // Obtiene el elemento del select de ciudades de origen.
    const selectCiudad = document.getElementById('Corigen');

    // Escucha los cambios en el select de países de origen.
    selectPais.addEventListener('change', () => {
        const countryCode = selectPais.value; // Obtiene el código del país seleccionado.

        if (countryCode) {
            // Realiza una solicitud al backend para obtener las ciudades del país seleccionado.
            fetch(`/Obtenerciudades/${countryCode}`)
                .then(response => response.json()) // Convierte la respuesta en un objeto JSON.
                .then(ciudades => {
                    // Limpia el select de ciudades antes de llenarlo con nuevas opciones.
                    selectCiudad.innerHTML = '<option value="">Selecciona la ciudad de origen</option>';

                    // Itera sobre la lista de ciudades obtenida.
                    ciudades.forEach(ciudad => {
                        const option = document.createElement('option'); // Crea una nueva opción para el select.
                        option.value = ciudad.name; // Asigna el nombre de la ciudad como valor de la opción.
                        option.textContent = `${ciudad.name} (${ciudad.stateCode})`; // Muestra el nombre y el código del estado.
                        // Agrega la latitud y longitud como atributos personalizados en la opción.
                        option.setAttribute('latitudO', ciudad.latitude);
                        option.setAttribute('longitudO', ciudad.longitude);
                        selectCiudad.appendChild(option); // Agrega la opción al select de ciudades.
                    });
                })
                .catch(error => {
                    // Muestra un error en la consola si la solicitud falla.
                    console.error('Error al cargar las ciudades:', error);
                });
        } else {
            // Limpia el select de ciudades si no hay país seleccionado.
            selectCiudad.innerHTML = '<option value="">Selecciona la ciudad de origen</option>';
        }
    });

    // Obtiene el elemento del select de países de destino.
    const selectPaisD = document.getElementById('Pdestino');
    // Obtiene el elemento del select de ciudades de destino.
    const selectCiudadD = document.getElementById('Cdestino');

    // Escucha los cambios en el select de países de destino.
    selectPaisD.addEventListener('change', () => {
        const countryCodeD = selectPaisD.value; // Obtiene el código del país seleccionado.

        if (countryCodeD) {
            // Realiza una solicitud al backend para obtener las ciudades del país seleccionado.
            fetch(`/Obtenerciudades/${countryCodeD}`)
                .then(response => response.json()) // Convierte la respuesta en un objeto JSON.
                .then(ciudades2 => {
                    // Limpia el select de ciudades antes de llenarlo con nuevas opciones.
                    selectCiudadD.innerHTML = '<option value="">Selecciona la ciudad de destino</option>';

                    // Itera sobre la lista de ciudades obtenida.
                    ciudades2.forEach(ciudad2 => {
                        const option2 = document.createElement('option'); // Crea una nueva opción para el select.
                        option2.value = ciudad2.name; // Asigna el nombre de la ciudad como valor de la opción.
                        option2.textContent = `${ciudad2.name} (${ciudad2.stateCode})`; // Muestra el nombre y el código del estado.
                        // Agrega la latitud y longitud como atributos personalizados en la opción.
                        option2.setAttribute('latitudD', ciudad2.latitude);
                        option2.setAttribute('longitudD', ciudad2.longitude);
                        selectCiudadD.appendChild(option2); // Agrega la opción al select de ciudades.
                    });
                })
                .catch(error => {
                    // Muestra un error en la consola si la solicitud falla.
                    console.error('Error al cargar las ciudades:', error);
                });
        } else {
            // Limpia el select de ciudades si no hay país seleccionado.
            selectCiudadD.innerHTML = '<option value="">Selecciona la ciudad de destino</option>';
        }
    });
});
