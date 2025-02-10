// Importar las variables de entorno desde el archivo .env
require('dotenv').config();
// Importar el framework Express para el desarrollo de aplicaciones web
const express = require('express');
const app = express();  // Crear una instancia de la aplicación Express
// Importar Mongoose para la conexión y manejo de bases de datos MongoDB
const mongoose = require('mongoose');
// Importar Body-Parser para analizar las solicitudes HTTP
const bodyParser = require('body-parser');
// Importar el módulo Path para trabajar con rutas y archivos del sistema de archivos
const path = require('path');
// Importar Axios para realizar peticiones HTTP a APIs externas
const axios = require('axios');
// Importar el módulo FS para trabajar con archivos del sistema de archivos (versión básica)
const fs = require('fs');
// Importar el módulo FS con promesas para manejar archivos de forma asíncrona
const fs2 = require('fs').promises;
// Importar el módulo SOAP para trabajar con servicios web SOAP
const soap = require('soap');
// Importar Bcrypt para el manejo de contraseñas mediante hashing
const bcrypt = require('bcrypt');
// Importar JWT para la creación y verificación de tokens de autenticación
const jwt = require('jsonwebtoken');
// Importar el modelo de usuario definido en otro archivo
const User = require('./models/User');

// Definir el puerto en el que la aplicación estará escuchando
const PORT = 3000;



// Configurar Body-Parser para interpretar solicitudes con datos codificados en URL
app.use(bodyParser.urlencoded({ extended: true }));
// Configurar Body-Parser para interpretar solicitudes con datos en formato JSON
app.use(bodyParser.json());
// Establecer EJS como motor de plantillas para las vistas de la aplicación
app.set('view engine', 'ejs');
// Establecer la ubicación de las vistas de la aplicación
app.set('views', path.join(__dirname, 'views'));
// Configurar el directorio 'public' como recurso estático para archivos CSS, JS, imágenes, etc.
app.use(express.static(path.join(__dirname, 'public')));



// Conectar a la base de datos MongoDB utilizando la URI almacenada en las variables de entorno
mongoose.connect(process.env.MONGODB_URI)
// Manejar la conexión exitosa a la base de datos
  .then(() => console.log('Conectado a la DB'))
// Manejar cualquier error de conexión a la base de datos
  .catch((error) => console.log('Error de conexión :C', error));



// Configurar las rutas principales de la aplicación web
app.use('/', require('./routes/Rutas'));



// Ruta POST para el registro de nuevos usuarios
app.post('/register', async (req, res) => {
  try {
    // Desestructurar los datos del cuerpo de la solicitud
    const { username, age, password } = req.body;

    // Verificar que todos los campos obligatorios están presentes
    if (!username || !age || !password) {
      return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
    }

    // Consultar si ya existe un usuario con el mismo nombre de usuario
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'El nombre de usuario ya está en uso.' });
    }

    // Hashear la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo objeto de usuario con los datos recibidos
    const newUser = new User({ username, age, password: hashedPassword });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    // Enviar una respuesta de éxito al cliente
    res.status(201).send({
      message: 'Cuenta creada exitosamente. Por favor inicia sesión.'
    });
  } catch (error) {
    // Manejar errores internos del servidor
    res.status(500).send({ message: 'Error en el servidor.', error });
  }
});




// Ruta POST para el inicio de sesión de usuarios
app.post('/login', async (req, res) => {
  try {
    // Desestructurar los datos del cuerpo de la solicitud
    const { username, password } = req.body;

    // Verificar que ambos campos están presentes
    if (!username || !password) {
      return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
    }

    // Buscar al usuario en la base de datos por su nombre de usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }

    // Validar la contraseña del usuario
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Contraseña incorrecta.' });
    }

    // Generar un token JWT para la autenticación del usuario
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar una respuesta exitosa al cliente con el token
    res.status(200).send({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    // Manejar errores internos del servidor
    res.status(500).send({ message: 'Error en el servidor.', error });
  }
});




// Función middleware para verificar el token JWT en las solicitudes
function verifyToken(req, res, next) {
  // Obtener el encabezado de autorización de la solicitud
  const authHeader = req.headers['authorization'];
  
  // Verificar si el encabezado de autorización está presente
  if (!authHeader) {
      return res.status(403).json({ success: false, message: 'Token no proporcionado' });
  }

  // Extraer el token del formato "Bearer token"
  const token = authHeader.split(' ')[1];
  
  // Verificar que el token esté presente
  if (!token) {
      return res.status(403).json({ success: false, message: 'Token no proporcionado' });
  }

  // Verificar el token usando la clave secreta almacenada en las variables de entorno
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(403).json({ success: false, message: 'Token inválido' });
      }
      
      // Almacenar el ID del usuario decodificado en el objeto `req` para su uso posterior
      req.userId = decoded.id;
      
      // Continuar con la ejecución de la siguiente función en la cadena de middleware
      next();
  });
}



// Ruta GET para chequear el estado de la sesión
app.get('/checkSession', verifyToken, (req, res) => {
  // Si el token es válido, la sesión está activa
  res.json({ sesionActiva: true });
});



// Ruta POST para cerrar la sesión
app.post('/logout', verifyToken, (req, res) => {
  // Aquí puedes implementar la lógica para invalidar el token si es necesario
  res.json({ loggedOut: true });
});




// Credenciales de la API Amadeus
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

// Token Acceso a Amadeus
var accessToken = '';
async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    console.log('Access Token fetched successfully:', accessToken);
  } catch (error) {
    console.error('Error en el Acceso a API Amadeus:', error.response.data);
  }
}

// Crear el viaje
app.post('/create-trip', async (req, res) => {
  const { budget, currency, adults, children, origin, destination, departureDate } = req.body;
  try {
      // Convertir las ciudades a códigos IATA
      const originCode = await getCityCode(origin);
      const destinationCode = await getCityCode(destination);

      // Solicitar vuelos
      const flightResponse = await axios.get(
          'https://test.api.amadeus.com/v2/shopping/flight-offers',
          {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: {
                  originLocationCode: originCode,
                  destinationLocationCode: destinationCode,
                  adults,
                  children,
                  currencyCode: currency,
                  maxPrice: budget / 2, // Ejemplo de dividir el presupuesto
                  departureDate,  // Aquí pasamos la fecha de salida
              },
          }
      );

      // Solicitar hoteles
      const hotelResponse = await axios.get(
          'https://test.api.amadeus.com/v2/shopping/hotel-offers',
          {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: {
                  cityCode: destinationCode,
                  currency,
                  adults,
              },
          }
      );
  


      // Combinar resultados
      const travelProposal = {
          flights: flightResponse.data.data,
          hotels: hotelResponse.data.data,
      };

      res.json(travelProposal);
  } catch (error) {
      console.error('Error fetching travel proposals:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create travel proposal.' });
  }
});

//Buscar ciudades con Aeropuertos Internacionales
async function fetchAndSaveAirports() {
  try {
    const apiKey = '039230b09af0d11ad3871ed7f0237efd'; // Reemplaza con tu clave API de Aviationstack

    // Ruta del archivo en la carpeta "data"
    const folderPath = path.join(__dirname, '/public/archives');
    const filePath = path.join(folderPath, 'aeropuertos.txt');

    // Verificar si el archivo existe y tiene contenido
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log('El archivo ya existe y tiene contenido. No se realizará la escritura.');
        return;
      }
    }

    // Llamar a la API
    const response = await axios.get('http://api.aviationstack.com/v1/airports', {
      params: {
        access_key: apiKey,
      },
    });
    // Filtrar y mapear los aeropuertos relevantes
    const citiesWithAirports = response.data.data
      .map(airport => ({
        airportName: airport.airport_name, // Nombre del aeropuerto
        city: airport.city_iata_code,
        countryName: airport.country_name,
        countryIATA: airport.country_iso2,
        iataCode: airport.iata_code, // Código IATA del aeropuerto
      }))
      .filter(airport => airport.airportName && airport.city && airport.countryName && airport.countryIATA && airport.iataCode); // Filtrar solo los aeropuertos completos
      
    // Si no hay datos, mostrar un mensaje y salir
    if (citiesWithAirports.length === 0) {
      console.log('No se encontraron aeropuertos para guardar.');
      return;
    }

    // Crear el contenido del archivo
    const fileContent = citiesWithAirports.map(({ airportName, city, countryName, countryIATA, iataCode }) =>
      `Aeropuerto: ${airportName}\nCiudad: ${city}\nPaís: ${countryName}\nCódigo IATA (País): ${countryIATA}\nCódigo IATA (Aeropuerto): ${iataCode}\n\n`
    ).join('');

    // Verificar si la carpeta existe; si no, crearla
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Escribir el archivo
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log('Archivo creado con éxito');
  } catch (error) {
    console.error('Error al conectar con la API de Aviationstack:', error.message);
  }
}




// Define el servicio SOAP para buscar lugares según los intereses del usuario
const service = {
  // Definición del servicio Recomendaciones
  RecomendacionesService: {
    // Definición del puerto de servicio RecomendacionesPort
    RecomendacionesPort: {
      // Función para obtener recomendaciones según los intereses del usuario
      GetRecommendations: function (args, callback) {
        // Extraer los intereses del usuario y convertirlos en un arreglo
        const userInterests = args.interests?.split(',') || [];

        // Obtener los destinos desde el archivo utilizando una promesa
        DestinosDeArchivo().then(destinations => {
          // Filtrar los destinos que coinciden con los intereses del usuario
          const recommendedDestinations = destinations.filter(destination =>
            destination.interests.some(interest => userInterests.includes(interest))
          ).slice(0, 8);  // Obtener hasta 8 recomendaciones

          // Formatear las recomendaciones para la respuesta
          const recommendations = recommendedDestinations.map(dest => ({
            name: dest.name,
            description: dest.description,
            image: dest.image
          }));

          // Llamar al callback con las recomendaciones
          callback(null, { recommendations });
        }).catch(error => {
          console.error("Error al obtener recomendaciones:", error);
          callback(error);  // Enviar el error al callback si ocurre uno
        });
      }
    }
  }
};





// Función para leer el archivo de texto que contiene los destinos
async function DestinosDeArchivo() {
  try {
      // Leer el archivo de destinos en formato texto
      const data = await fs2.readFile(path.join(__dirname, 'public/archives/destinos.txt'), 'utf8');

      // Dividir el contenido del archivo en líneas y filtrar las líneas vacías
      const lines = data.split('\n').filter(line => line.trim() !== '');

      // Mapeo de cada línea a un objeto con nombre, descripción, imagen e intereses
      const destinations = lines.map(line => {
          const [name, description, image, interests] = line.split('|');
          return {
              name: name.trim(),                 // Eliminar espacios al inicio y al final
              description: description.trim(),   // Eliminar espacios al inicio y al final
              image: image.trim(),                // Eliminar espacios al inicio y al final
              interests: interests.split(',').map(interest => interest.trim())  // Dividir los intereses y eliminar espacios
          };
      });

      return destinations;  // Retornar el array de destinos procesados
  } catch (error) {
      console.error('Error al leer destinos:', error);  // Registrar el error si ocurre uno
      return [];  // Retornar un arreglo vacío en caso de error
  }
}




// Endpoint para conectarse al servicio SOAP que proporciona recomendaciones basadas en los intereses del usuario
const SOAP_URL = 'http://localhost:3000/soap?wsdl';
app.post('/InteresesUsuario', async (req, res) => {
  try {
    // Obtener los intereses del usuario desde el cuerpo de la solicitud
    const interests = req.body.interests || [];
    
    // Crear un cliente SOAP usando el URL del servicio WSDL
    const client = await soap.createClientAsync(SOAP_URL);
    
    // Invocar el método GetRecommendations del servicio SOAP con los intereses del usuario
    const result = await client.GetRecommendationsAsync({ interests: interests.join(',') });

    // Verificar si se obtuvieron recomendaciones y manejarlas correctamente
    if (result) {
      // Convertir el resultado a un arreglo si es necesario
      const recommendations = Array.isArray(result[0].recommendations)
                ? result[0].recommendations
                : [result[0].recommendations];

      // Enviar las recomendaciones al cliente como respuesta JSON
      res.json(recommendations);
      
    } else {
      // Manejar la situación donde no se encontraron recomendaciones o la estructura no es válida
      console.error("No se encontraron recomendaciones o la estructura no es válida.");
      res.status(500).send('No se encontraron recomendaciones');
    }
  } catch (error) {
    // Manejar errores generales en la conexión o procesamiento del servicio SOAP
    console.error('Error:', error);
    res.status(500).send('Error al obtener recomendaciones');
  }
});





// Ruta GET para leer el archivo de texto que contiene los aeropuertos
app.get('/api/airports', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'archives', 'aeropuertos.txt');  // Definir la ruta del archivo de aeropuertos

  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    // Leer el contenido del archivo de aeropuertos
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Llamar a la función para parsear el contenido del archivo
    const airportsData = parseAirportsData(fileContent);
    
    // Responder con los datos parseados en formato JSON
    res.json(airportsData);
  } else {
    // Si el archivo no se encuentra, responder con un error 404
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});




// Función para parsear el contenido del archivo de aeropuertos
function parseAirportsData(fileContent) {
  const airports = [];  // Arreglo para almacenar los aeropuertos
  const lines = fileContent.split('\n');  // Dividir el contenido en líneas
  let currentAirport = null;  // Objeto para almacenar información del aeropuerto actual

  lines.forEach(line => {
    if (line.startsWith('Aeropuerto:')) {
      // Si la línea comienza con 'Aeropuerto:', se inicia la información de un nuevo aeropuerto
      if (currentAirport) {
        airports.push(currentAirport);  // Almacenar el aeropuerto previo antes de iniciar uno nuevo
      }
      currentAirport = { name: line.replace('Aeropuerto: ', '').trim() };  // Crear objeto para el nuevo aeropuerto
    } else if (line.startsWith('Ciudad:')) {
      // Si la línea comienza con 'Ciudad:', agregar la ciudad al objeto del aeropuerto
      currentAirport.city = line.replace('Ciudad: ', '').trim();
    } else if (line.startsWith('País:')) {
      // Si la línea comienza con 'País:', agregar el país al objeto del aeropuerto
      currentAirport.country = line.replace('País: ', '').trim();
    } else if (line.startsWith('Código IATA (País):')) {
      // Si la línea comienza con 'Código IATA (País):', agregar el código IATA del país
      currentAirport.countryIATA = line.replace('Código IATA (País): ', '').trim();
    } else if (line.startsWith('Código IATA (Aeropuerto):')) {
      // Si la línea comienza con 'Código IATA (Aeropuerto):', agregar el código IATA del aeropuerto
      currentAirport.iataCode = line.replace('Código IATA (Aeropuerto): ', '').trim();
    }
  });

  if (currentAirport) {
    airports.push(currentAirport);  // Añadir el último aeropuerto después del bucle
  }

  return airports;  // Retornar el arreglo con los aeropuertos parseados
}




// Ruta GET para obtener información de un país utilizando la API REST Countries
app.get('/api/country-info', async (req, res) => {
  const { country } = req.query;  // Obtener el nombre del país desde los parámetros de la consulta

  if (!country) {
      return res.status(400).json({ error: 'Por favor, proporciona el nombre de un país o ciudad.' });
  }

  try {
      // Hacer una llamada a la API REST Countries con el nombre del país proporcionado
      const response = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
      
      // Obtener los datos del país desde el primer resultado
      const countryData = response.data[0];

      // Extraer y estructurar la información relevante del país
      const result = {
          name: countryData.name.common,  // Nombre común del país
          capital: countryData.capital ? countryData.capital[0] : 'No disponible',  // Capital del país o mensaje de no disponible
          region: countryData.region,  // Región geográfica
          subregion: countryData.subregion,  // Subregión geográfica
          population: countryData.population,  // Población del país
          languages: countryData.languages ? Object.values(countryData.languages).join(', ') : 'No disponible',  // Idiomas del país
          currencies: countryData.currencies
              ? Object.values(countryData.currencies)
                    .map(currency => `${currency.name} (${currency.symbol})`)
                    .join(', ')  // Monedas del país con su símbolo
              : 'No disponible',
          flag: countryData.flags.png,  // URL de la bandera del país
      };

      res.json(result);  // Enviar la información del país en formato JSON
  } catch (error) {
      // Manejar posibles errores en la petición a la API
      res.status(500).json({ error: 'No se pudo obtener la información del país. Verifica el nombre o intenta más tarde.' });
  }
});





// Ruta para obtener lugares de interes
app.get('/api/destinations', async (req, res) => {
  const capital = req.query.capital;  // Recibimos la ciudad o país desde la query
  const destinations = await getDestinations(capital);  // Llamamos a la función para obtener los destinos
  res.json(destinations);  // Devolvemos los destinos al frontend
});


// Función asíncrona para obtener destinos a partir de una consulta (ciudad o país)
async function getDestinations(query) {
  if (!query) {
    // Si no se proporciona un valor para 'query', devolver un mensaje de error
    return { success: false, message: "El campo 'capital' es obligatorio." };
  }

  try {
    // Configuración de la solicitud POST a la API de Travel Guide
    const options = {
      method: 'POST',  // Método HTTP para enviar datos
      url: 'https://travel-guide-api-city-guide-top-places.p.rapidapi.com/check',  // URL de la API de Travel Guide
      params: { noqueue: '1' },  // Parámetros de consulta adicionales
      headers: {
        'x-rapidapi-key': '687f2d4485mshefbbc9c94e804e9p1cb1c9jsn5eb06a796c38',  // Llave de API proporcionada por RapidAPI
        'x-rapidapi-host': 'travel-guide-api-city-guide-top-places.p.rapidapi.com',  // Host de la API
        'Content-Type': 'application/json'  // Tipo de contenido de la solicitud
      },
      data: {
        region: query,  // Ciudad o país proporcionado por el usuario
        language: 'es',  // Idioma de la respuesta
        interests: ['historical', 'cultural', 'food']  // Intereses específicos para la búsqueda
      }
    };

    // Realizar la solicitud HTTP a la API y esperar la respuesta
    const response = await axios(options);
    
    // Acceder a los datos del resultado desde la respuesta
    const travelInfo = response.data.result;  // Extraer la propiedad 'result' de la respuesta

    // Verificar si la respuesta es un arreglo válido
    if (!Array.isArray(travelInfo)) {
      return { success: false, message: "La respuesta no contiene información válida." };
    }

    return { success: true, travelInfo };  // Retornar los destinos obtenidos
  } catch (error) {
    console.error('Error al conectar con la API:', error);  // Manejamos errores de conexión
    return { success: false, message: "Error al obtener información de la API." };
  }
}




// Ruta para leer el archivo 'paises.txt' y retornar los datos en formato JSON
app.get('/leerpaises', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'archives', 'paises.txt');  // Ruta del archivo de países

  // Leer el archivo de texto usando fs (File System)
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error al leer el archivo:', err);  // Loguear el error si ocurre
          return res.status(500).json({ error: 'No se pudo leer el archivo' });  // Enviar mensaje de error al cliente
      }

      // Procesar el contenido del archivo en un arreglo de objetos
      const paises = data.split('\n').map(line => {  // Separar el archivo por líneas
          const [code, name] = line.split(',').map(item => item.trim());  // Dividir cada línea por coma y limpiar espacios
          return { code, name };  // Retornar objeto con 'code' y 'name'
      });

      res.json(paises);  // Enviar el arreglo de países como respuesta en formato JSON
  });
});




// Conexión a la API para obtener ciudades según el código de país
app.get('/Obtenerciudades/:countrycode', async (req, res) => {
  const countryCode = req.params.countrycode;  // Obtener el código del país desde los parámetros de la URL

  // Opciones de configuración para la solicitud GET a la API externa
  const options = {
      method: 'GET',
      url: 'https://country-state-city-search-rest-api.p.rapidapi.com/cities-by-countrycode',
      params: { countrycode: countryCode },  // Enviar el código de país como parámetro
      headers: {
          'x-rapidapi-key': '687f2d4485mshefbbc9c94e804e9p1cb1c9jsn5eb06a796c38',  // API Key para autenticación
          'x-rapidapi-host': 'country-state-city-search-rest-api.p.rapidapi.com'  // Host de la API
      }
  };

  try {
      const response = await axios.request(options);  // Realizar la solicitud a la API
      const cities = response.data.map(city => ({  // Procesar la respuesta para extraer datos relevantes
          name: city.name,  // Nombre de la ciudad
          stateCode: city.stateCode,  // Código del estado
          latitude: city.latitude,  // Latitud de la ciudad
          longitude: city.longitude  // Longitud de la ciudad
      }));
      res.json(cities);  // Enviar las ciudades procesadas como respuesta al cliente
  } catch (error) {
      console.error('Error al obtener las ciudades:', error);  // Loguear cualquier error
      res.status(500).json({ error: 'No se pudo obtener las ciudades' });  // Enviar mensaje de error al cliente
  }
});




// Ruta para calcular la distancia entre dos puntos geográficos
app.post('/calcularDistancia', async (req, res) => {
  const { lat1, long1, lat2, long2 } = req.body;  // Obtener las coordenadas de inicio y fin desde el cuerpo de la solicitud

  // Configuración de las opciones para la solicitud GET a la API externa de cálculo de distancias
  const options = {
      method: 'GET',
      url: 'https://distance-calculator8.p.rapidapi.com/calc',  // URL de la API para calcular distancias
      params: {
          startLatitude: lat1,  // Latitud de inicio
          startLongitude: long1,  // Longitud de inicio
          endLatitude: lat2,  // Latitud de destino
          endLongitude: long2  // Longitud de destino
      },
      headers: {
          'x-rapidapi-key': '687f2d4485mshefbbc9c94e804e9p1cb1c9jsn5eb06a796c38',  // API Key para autenticación
          'x-rapidapi-host': 'distance-calculator8.p.rapidapi.com'  // Host de la API
      }
  };

  try {
      const response = await axios.request(options);  // Realizar la solicitud a la API
      const distancia = response.data.body.distance;  // Extraer la distancia de la respuesta
      res.json({ distance: distancia.kilometers });  // Enviar la distancia calculada en kilómetros como respuesta
  } catch (error) {
      console.error('Error al calcular la distancia:', error);  // Loguear cualquier error
      res.status(500).json({ error: 'No se pudo calcular la distancia' });  // Enviar mensaje de error al cliente
  }
});




// Ruta para calcular la huella de carbono utilizando un servicio SOAP externo
const SOAP_URL2 = 'http://localhost:3000/huellaC?wsdl';
app.post('/calcularHuellaCarbono', async (req, res) => {
  const { distancia, medios } = req.body;  // Obtener los datos de la distancia y los medios de transporte del cuerpo de la solicitud
  const intDistancia = req.body.distancia;  // Conversión de distancia a tipo entero o flotante
  const ArrMedios = Array.isArray(req.body.medios) ? req.body.medios : [req.body.medios];  // Conversión de medios de transporte a arreglo

  // Validar que se proporcionen al menos los datos de distancia y un medio de transporte
  if (!intDistancia || !ArrMedios || ArrMedios.length === 0) {
    return res.status(400).json({ error: "Datos inválidos. Proporcione al menos un medio de transporte." });
  }

  try {
    try {
      // Crear un cliente SOAP con el URL del servicio
      const client = await soap.createClientAsync(SOAP_URL2);
      // Llamar al método SOAP Calculo con la distancia y los medios proporcionados
      const [result] = await client.CalculoAsync({ distancia,  medios: ArrMedios });
      // Enviar la huella de carbono obtenida como respuesta al cliente
      res.json({ huellaCarbono: result.huellaCarbono });

    }catch(error){
      console.error("Error al crear el cliente SOAP:", error);  // Loguear error al crear el cliente SOAP
    }
  } catch (error) {
    console.error("Error al conectar con el servicio SOAP:", error);  // Loguear error al conectarse al servicio SOAP
    res.status(500).json({ error: "Error al calcular la huella de carbono mediante el servicio SOAP." });  // Enviar mensaje de error al cliente
  }
});




// Define el servicio SOAP que calcula la huella de carbono según los medios de transporte y la distancia.
const service2 = {
  HuellaCarbonoService: {
    HuellaCarbonoPort: {
      // Método para calcular la huella de carbono
      Calculo: function (args, callback) {
        // Definir los promedios de emisiones por medio de transporte
        const PromedioEmiciones = {
          coche: 0.21,  // Emisiones promedio en kg CO2 por km para coche
          tren: 0.05,   // Emisiones promedio en kg CO2 por km para tren
          avion: 0.15,  // Emisiones promedio en kg CO2 por km para avión
          barco: 0.18   // Emisiones promedio en kg CO2 por km para barco
        };

        const { distancia, medios } = args;

        // Validar que se proporcionen los datos necesarios
        if (!distancia || !medios || medios.length === 0) {
          return callback(new Error("Datos inválidos. Proporcione al menos un medio de transporte."));
        }

        // Convertir los medios de transporte a un arreglo si no lo son
        const ArrMedios = Array.isArray(args.medios) ? args.medios : [args.medios];

        // Inicializar el cálculo de la huella de carbono
        let huellaCarbonoTotal = 0;
        
        // Calcular la huella total sumando las emisiones según el medio de transporte
        ArrMedios.forEach(medio => {
          if (PromedioEmiciones[medio]) {
            huellaCarbonoTotal += PromedioEmiciones[medio] * distancia;  // Emisiones por km * distancia
          }
        });

        // Devolver el resultado del cálculo al cliente SOAP
        callback(null, { huellaCarbono: huellaCarbonoTotal });
      },
    },
  },
};



// Endpoint para buscar vuelos usando la API de Amadeus.
app.post('/vuelo', async (req, res) => {
  // Desestructurar los campos necesarios del cuerpo de la solicitud
  const { origin, destination, departureDate, returnDate, adults, children, travelClass } = req.body;

  // Validar que se proporcionen los campos obligatorios
  if (!origin || !destination || !departureDate || !adults) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
      // Crear la URL del endpoint de búsqueda de vuelos en Amadeus
      let amadeusEndpoint = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&travelClass=${travelClass}`;

      // Añadir parámetros opcionales si están presentes
      if (returnDate) amadeusEndpoint += `&returnDate=${returnDate}`;
      if (children) amadeusEndpoint += `&children=${children}`;

      // Llamar a la API de Amadeus para obtener las ofertas de vuelos
      const amadeusResponse = await fetch(amadeusEndpoint, {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${accessToken}`,  // Usar el token de acceso previamente obtenido
          },
      });

      // Validar si la respuesta de Amadeus fue exitosa
      if (!amadeusResponse.ok) {
          throw new Error(`Error al llamar a la API de Amadeus: ${amadeusResponse.statusText}`);
      }

      // Parsear la respuesta JSON de Amadeus
      const flightData = await amadeusResponse.json();

      // Enviar los datos de vuelos al cliente (frontend)
      res.json(flightData);
  } catch (error) {
      console.error('Error al buscar vuelos:', error);
      console.log(amadeusEndpoint);  // Mostrar endpoint usado en el error para depuración
      res.status(500).json({ error: 'Hubo un problema al buscar vuelos.' });
  }
});



const service3 = {
  CurrencyConverterService: {
    CurrencyConverterPort: {
      // Función que realiza la conversión de monedas
      ConvertCurrency: function (args) {
        const rates = {
          USD: { EUR: 0.85, MXN: 20, GBP: 0.75 },
          EUR: { USD: 1.18, MXN: 23.5, GBP: 0.88 },
          MXN: { USD: 0.05, EUR: 0.042, GBP: 0.038 },
          GBP: { USD: 1.33, EUR: 1.14, MXN: 26.3 },
        };

        const { fromCurrency, toCurrency, amount } = args;  // Destructuración de los parámetros

        // Si alguno de los campos requeridos falta, se lanza un error
        if (!fromCurrency || !toCurrency || !amount) {
          throw new Error('Por favor, proporcione todas las monedas de origen, destino y la cantidad.');
        }

        const rate = rates[fromCurrency]?.[toCurrency];  // Obtiene la tasa de cambio, si existe

        // Si no se encuentra la tasa de cambio, se lanza un error
        if (!rate) {
          throw new Error('La tasa de conversión no se encuentra para estas monedas.');
        }

        const convertedAmount = amount * rate;  // Realiza la conversión

        // Retorna la cantidad convertida, monedas de origen y destino, y la cantidad inicial
        return {
          convertedAmount,
          fromCurrency,
          toCurrency,
          amount,
          message: `Conversión realizada con éxito.`,
        };
      },
    },
  },
};






// Cargar el archivo WSDL Destinos
const wsdlPath = path.join(__dirname, 'Destinos.wsdl');
const wsdl = fs.readFileSync(wsdlPath,'utf8');

//Cargar archivo WSDL HuellaCarbono
const wsdlPath2 = path.join(__dirname, 'HuellaCarbono.wsdl');
const wsdl2 = fs.readFileSync(wsdlPath2, 'utf8');

//Cargar archivo WSDL Conversor
const wsdlPath3 = path.join(__dirname, 'Conversor.wsdl');
const wsdl3 = fs.readFileSync(wsdlPath3, 'utf8');

// Inicio del servidor
app.listen(PORT, async () => {
  // Log del servidor
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  // Iniciar el servidor SOAP para el servicio de Destinos
  soap.listen(app, '/soap', service, wsdl, (err) => {
    if (err) {
      console.error('Error al iniciar el servidor Destinos SOAP:', err);
    } else {
      console.log('Servidor SOAP iniciado en /soap');
    }
  });

  // Iniciar el servidor SOAP para el servicio de Huella de Carbono
  soap.listen(app, '/huellaC', service2, wsdl2, (err) => {
    if (err) {
      console.error('Error al iniciar el servidor HuellaCarbono SOAP:', err);
    } else {
      console.log('Servidor SOAP iniciado en /HuellaC');
    }
  });

  // Iniciar el servidor SOAP para el conversor de monedas
  soap.listen(app, '/conversor', service3, wsdl3, (err) => {
    if (err) {
      console.error('Error al iniciar el servidor de conversion SOAP:', err);
    } else {
      console.log('Servidor SOAP iniciado en /conversor');
    }
  });

  // Obtener el token de acceso
  await getAccessToken();

  // Descargar y guardar los aeropuertos
  await fetchAndSaveAirports();
});

