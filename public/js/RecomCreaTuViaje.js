
document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const availableList = document.getElementById('available-list');  // Lista de elementos disponibles
    const selectedList = document.getElementById('selected-list');    // Lista de elementos seleccionados
    const getRecommendationsButton = document.getElementById('get-recommendations');  // Botón para obtener recomendaciones
    const destinationsContainer = document.getElementById('destinations');  // Contenedor para mostrar destinos

    // Evento para manejar el clic en elementos disponibles
    availableList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {  // Verifica si el elemento clicado es un <LI>
            const selectedItem = event.target.cloneNode(true);  // Clonar el elemento clicado
            selectedList.appendChild(selectedItem);  // Añadir el elemento a la lista de seleccionados

            // Configuración del estilo de la lista seleccionada
            selectedList.style.display = 'grid';
            selectedList.style.gridTemplateColumns = 'repeat(4, auto)';  // 4 columnas de tamaño igual
            selectedList.style.gridTemplateRows = 'repeat(5, auto)';
            selectedList.style.padding = '2rem';

            availableList.removeChild(event.target);  // Remover el elemento de la lista disponible
        }
    });

    // Evento para manejar el clic en elementos seleccionados
    selectedList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {  // Verifica si el elemento clicado es un <LI>
            const availableItem = event.target.cloneNode(true);  // Clonar el elemento clicado
            availableList.appendChild(availableItem);  // Añadir el elemento a la lista de disponibles
            selectedList.removeChild(event.target);  // Remover el elemento de la lista seleccionada
        }
    });


    document.getElementById('get-recommendations').addEventListener('click', () => {
        // Obtener todos los elementos LI de la lista seleccionada
        const selectedItems = document.querySelectorAll('#selected-list li');

        // Verificar si la lista está vacía
        if (selectedItems.length === 0) {
            alert("Por favor, selecciona al menos un interés.");  // Mostrar alerta si no hay elementos seleccionados
            return;  // Detener la ejecución si no hay elementos seleccionados
        }

        // Obtener los intereses seleccionados a partir de los atributos de los LI
        const interests = Array.from(selectedItems).map(item => item.getAttribute('data-interest'));

        // Obtener el contenedor donde se mostrarán las recomendaciones
        const RecomendacionesHTML = document.getElementById('recommendationsPanel');

        RecomendacionesHTML.innerHTML = 'Cargando...';  // Muestra un mensaje de carga mientras se obtienen las recomendaciones
        console.log("intereses enviados: ", interests);  // Muestra los intereses enviados al backend

        // Enviar los intereses al backend usando axios
        axios.post('http://localhost:3000/InteresesUsuario', { interests })
            .then(response => {
                console.log('Recomendaciones recibidas:', response.data);
                const datosDI = response.data;  // Almacena las recomendaciones recibidas del backend

                RecomendacionesHTML.style.display = 'grid';  // Muestra las recomendaciones en un formato de cuadrícula
                RecomendacionesHTML.style.gridTemplateColumns = 'repeat(4, auto)';  // Define el número de columnas en la cuadrícula
                RecomendacionesHTML.style.gridTemplateRows = 'repeat(5, auto)';  // Define el número de filas en la cuadrícula
                RecomendacionesHTML.style.padding = '2rem';  // Agrega padding alrededor de las recomendaciones

                if (datosDI) {
                    // Renderizar destinos turísticos basados en las recomendaciones
                    RecomendacionesHTML.innerHTML = 
                    ` <div class="TituloDestinosP" style="grid-area: 1/1/2/5; font-size: 2.3rem; font-family: Flamenco, serif; padding: 1rem 3rem 1rem 3rem; text-align: center">
                        <h2>Los siguientes lugares suenan a: ${interests}, los destinos perfectos para tu próximo viaje ...</h2>
                    </div>` + 
                    datosDI.map(destination => `
                        <div class="DestinosSugeridosA destinosConAnimacion" style="background-color: rgb(228, 228, 228); padding: 1.3rem; margin: 0.5rem; border: 1px black solid; position: relative; border-radius: 5px">
                            <h3 style="z-index: 2; font-family: Flamenco, serif; font-size: 2.5rem; font-weight: 700; text-align: center;">${destination.name}</h3>
                            <p style="z-index: 2; font-family: Flamenco, serif; text-align: center; font-size: 1.9rem; font-weight: 400; color: black;">${destination.description}</p>
                            <img src="${destination.image}" style="width: 90%; height: 80%; z-index: 0; border-radius: 50%; opacity: 0.35; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: cover;"> 
                        </div>
                    `).join('');  // Concatena las tarjetas de destino en una sola cadena de HTML

                } else {
                    RecomendacionesHTML.innerHTML = `<p>Error: No se encontraron recomendaciones.</p>`;  // Muestra un mensaje de error si no se obtienen recomendaciones
                }


                Array.from(selectedItems).forEach(item => {
                    availableList.appendChild(item);  // Mover cada elemento de la lista seleccionada al listado disponible
                });
                selectedList.innerHTML = '';  // Limpiar la lista seleccionada después de mover los elementos                
            })
            .catch(error => {
                console.error("Error al obtener las recomendaciones:", error);
            });
    });
});
