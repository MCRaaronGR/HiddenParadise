const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    autor: {
        type: mongoose.Schema.Types.ObjectId, // Relación con la colección de usuarios
        ref: 'User',                         // Nombre del modelo relacionado
        required: true
    },
    titulo: { 
        type: String,
        required: true,
        unique: true
    },
    lugar: { 
        type: String,
        required: true
    },
    contenido: { 
        type: String,
        required: true
    }
});

const Comentario = mongoose.model('Comment', commentSchema);

module.exports = Comentario;

