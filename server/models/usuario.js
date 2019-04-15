const mongoose = require('mongoose');
//Validador para evitar que se inserten objetos con una misma propiedad
const uniqueValidator = require('mongoose-unique-validator');

//Roles válidos
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario.']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario.']
    },
    password: {
        type: String,
        required: [true, 'El password es necesario.']

    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: "USER_ROLE",
        required: true,
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});
//Método para eliminar el campo password en la respuesta de la petición.
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

//Plugin para evitar que se puedan crear Objetos con un mismo campo (email)
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} ya se encuentra registrado en la Base de Datos.'
})

module.exports = mongoose.model('Usuario', usuarioSchema);