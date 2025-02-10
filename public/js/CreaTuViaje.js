
document.getElementById('tripForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch('/create-trip', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log('Travel Proposals:', result);
        alert('Trip created successfully! Check console for details.');
    } catch (error) {
        console.error('Error creating trip:', error);
        alert('Failed to create trip.');
    }
});

async function fetchAirportsFromBackend() {
  try {
    const response = await fetch('/api/airports');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const airports = await response.json();

    // Ordenar los aeropuertos alfabéticamente por país
    airports.sort((a, b) => a.country.localeCompare(b.country));

    // Llenar el select de países
    const countriesSelect = document.getElementById('origin');
    const countries = new Set(); // Usamos Set para evitar duplicados

    // Llenar el select de ciudades
    const citiesSelect = document.getElementById('destination');
    const cities = new Set(); // Usamos Set para evitar duplicados

    airports.forEach(airport => {
      // Agregar países al select de origen
      if (airport.name && airport.country && airport.iataCode) {
        const originOption = document.createElement('option');
        originOption.value = airport.countryIATA; // Código IATA del país
        originOption.textContent = `${airport.name} (${airport.country})`; // Nombre del país
        countries.add(originOption);
      }
      // Agregar países al select de destino
      if (airport.name && airport.country && airport.iataCode) {
        const DestinyOption = document.createElement('option');
        DestinyOption.value = airport.countryIATA; // Código IATA del país
        DestinyOption.textContent = `${airport.name} (${airport.country})`; // Nombre del país
        cities.add(DestinyOption);
      }
    });

    // Agregar los países al select de origen
    countries.forEach(originOption => countriesSelect.appendChild(originOption));

    // Agregar las ciudades al select de destino
    cities.forEach(DestinyOption => citiesSelect.appendChild(DestinyOption));

  } catch (error) {
    console.error('Error al obtener aeropuertos del backend:', error);
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', fetchAirportsFromBackend);
