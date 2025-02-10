// Esquema de usuario para MongoDB usando Mongoose
const mongoose = require('mongoose');

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
    username: { 
        type: String,   // Tipo de dato: String
        required: true,  // Campo obligatorio
        unique: true     // Campo único
    },
    age: { 
        type: Number,   // Tipo de dato: Number
        required: true  // Campo obligatorio
    },
    password: { 
        type: String,   // Tipo de dato: String
        required: true  // Campo obligatorio
    }
});

// Creación del modelo de usuario basado en el esquema
const User = mongoose.model('User', userSchema);

// Exportación del modelo para ser utilizado en otros módulos
module.exports = User;
