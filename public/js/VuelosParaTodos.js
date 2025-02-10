//Funcion SOAP para la conversion de la moneda
document.getElementById('currencyConverterForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener los valores del formulario
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    // Verificar que las monedas sean diferentes
    if (fromCurrency === toCurrency) {
        document.getElementById('conversionResult').innerText = 'Selecciona monedas diferentes para la conversión.';
        return;
    }

    // Crear el cuerpo de la solicitud SOAP
    const soapRequest = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cur="http://example.com/currency-converter">
           <soapenv:Header/>
           <soapenv:Body>
              <cur:ConvertCurrencyRequest>
                 <fromCurrency>${fromCurrency}</fromCurrency>
                 <toCurrency>${toCurrency}</toCurrency>
                 <amount>${amount}</amount>
              </cur:ConvertCurrencyRequest>
           </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        // Enviar la solicitud SOAP
        const response = await fetch('/conversor', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
            },
            body: soapRequest,
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        // Leer y procesar la respuesta SOAP
        const responseText = await response.text();

        // Extraer el valor del XML usando DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, 'text/xml');
        const convertedAmount = xmlDoc.getElementsByTagName('convertedAmount')[0]?.textContent;

        // Mostrar el resultado
        if (convertedAmount) {
            document.getElementById('conversionResult').innerText = 
                `${amount} ${fromCurrency} son aproximadamente ${parseFloat(convertedAmount).toFixed(2)} ${toCurrency}.`;
        } else {
            document.getElementById('conversionResult').innerText = 'No se pudo realizar la conversión.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('conversionResult').innerText = 'Ocurrió un error al realizar la conversión.';
    }
});

document.getElementById('amadeusForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Obtener datos del formulario
    var formData = new FormData(this);
    var data = {
        origin: formData.get('origin'),
        destination: formData.get('destination'),
        departureDate: formData.get('departureDate'),
        returnDate: formData.get('returnDate') || undefined,
        adults: formData.get('adults'),
        children: formData.get('children') || 0,
        travelClass: formData.get('travelClass'),
    };
    console.log(data);
    try {
        // Enviar datos al backend
        const response = await fetch('/vuelo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error al enviar datos al backend: ${response.statusText}`);
        }

        // Procesar respuesta del backend
        const result = await response.json();
        console.log('Resultados de vuelos:', result);
        displayResults(result.data);
        alert('Vuelos encontrados. Revisa la consola para más detalles.');
    } catch (error) {
        console.error('Error al buscar vuelos:', error);
        alert('Hubo un problema al buscar vuelos. Revisa la consola para más información.');
    }
});


function displayResults(flights) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = ''; // Limpiar resultados anteriores

    flights.forEach(flight => {
        const row = document.createElement('tr');

        // Extraer detalles del vuelo
        const origin = flight.itineraries[0].segments[0].departure.iataCode;
        const destination = flight.itineraries[0].segments.slice(-1)[0].arrival.iataCode;
        const departureDate = flight.itineraries[0].segments[0].departure.at;
        const returnDate = flight.itineraries.length > 1 ? flight.itineraries[1].segments[0].departure.at : '-';
        const price = flight.price.total;
        const airline = flight.validatingAirlineCodes.join(', ');

        // Crear celdas para cada dato
        row.innerHTML = `
            <td>${origin}</td>
            <td>${destination}</td>
            <td>${departureDate}</td>
            <td>${returnDate}</td>
            <td>$${price}</td>
            <td>${airline}</td>
        `;

        tableBody.appendChild(row);
    });
}


async function populatePopularAirports() {
    const popularAirports = [
        { iataCode: "LAX", name: "Los Angeles International", country: "USA" },
        { iataCode: "JFK", name: "John F. Kennedy International", country: "USA" },
        { iataCode: "ORD", name: "O'Hare International", country: "USA" },
        { iataCode: "ATL", name: "Hartsfield-Jackson Atlanta International", country: "USA" },
        { iataCode: "CDG", name: "Charles de Gaulle", country: "France" },
        { iataCode: "LHR", name: "Heathrow", country: "United Kingdom" },
        { iataCode: "HND", name: "Tokyo Haneda", country: "Japan" },
        { iataCode: "DXB", name: "Dubai International", country: "UAE" },
        { iataCode: "FRA", name: "Frankfurt", country: "Germany" },
        { iataCode: "SIN", name: "Singapore Changi", country: "Singapore" },
        { iataCode: "ICN", name: "Incheon", country: "South Korea" },
        { iataCode: "SYD", name: "Sydney Kingsford Smith", country: "Australia" },
        { iataCode: "GRU", name: "São Paulo/Guarulhos", country: "Brazil" },
        { iataCode: "YYZ", name: "Toronto Pearson", country: "Canada" },
        { iataCode: "BKK", name: "Suvarnabhumi", country: "Thailand" },
        { iataCode: "MEX", name: "Mexico City International", country: "Mexico" },
        { iataCode: "EZE", name: "Ezeiza Ministro Pistarini", country: "Argentina" },
        { iataCode: "HKG", name: "Hong Kong International", country: "Hong Kong" },
        { iataCode: "AMS", name: "Amsterdam Schiphol", country: "Netherlands" },
        { iataCode: "MAD", name: "Madrid Barajas", country: "Spain" },
        { iataCode: "JNB", name: "OR Tambo International", country: "South Africa" },
        { iataCode: "DEL", name: "Indira Gandhi International", country: "India" },
        { iataCode: "DOH", name: "Hamad International", country: "Qatar" },
        { iataCode: "SEA", name: "Seattle-Tacoma International", country: "USA" },
        { iataCode: "MIA", name: "Miami International", country: "USA" },
        { iataCode: "SFO", name: "San Francisco International", country: "USA" },
        { iataCode: "IST", name: "Istanbul Airport", country: "Turkey" },
        { iataCode: "BCN", name: "Barcelona El Prat", country: "Spain" },
        { iataCode: "CPT", name: "Cape Town International", country: "South Africa" }
    ];

    // Referencias a los select
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');

    // Limpiar los selects antes de llenarlos
    originSelect.innerHTML = '';
    destinationSelect.innerHTML = '';

    // Crear opciones para los select
    popularAirports.forEach(airport => {
        const originOption = document.createElement('option');
        originOption.value = airport.iataCode;
        originOption.textContent = `${airport.name} (${airport.country})`;

        const destinationOption = originOption.cloneNode(true);

        originSelect.appendChild(originOption);
        destinationSelect.appendChild(destinationOption);
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', populatePopularAirports);

  

  