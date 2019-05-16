//Rutas para trabajar usuario.
const express = require('express');
//libreria para encriptar
const bcrypt = require('bcrypt');
//Libreria underscore agrega funcionalidades para trabajar con Objetos
const _ = require('underscore');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');
const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {

    let desde = req.query.desde || 0; //Desde que página quiere ver los resultados, si no escoje por defecto 0
    desde = Number(desde);
    let limite = req.query.limite || 5; //Cuantos resultados quiere ver por página
    limite = Number(limite);


    Usuario.find({ estado: true }, 'nombre email role estado google img') //Regresar solo los campos mencionados
        .skip(desde) //Desde que página mostrar
        .limit(limite) //Obtener de 5 en 5
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "No se pueden mostrar los usuarios.",
                    err
                })
            }
            //Debe tener el mismo parámetro de Usuario.find para que los cuente de la misma manera
            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        msg: "No se pueden contar los usuarios.",
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    cuantos_registros: conteo,
                    usuarios
                })
            });

        })
});

app.post('/usuario', [verificaToken, verificaAdminRol], function(req, res) {
    //Recibimos los datos enviados
    let body = req.body;
    //Se crea un nuevo Objeto Usuario con los datos recibidos
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //Encriptación del password
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    //Se guarda el usuario en la BD
    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo crear el nuevo usuario.",
                err
            })
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            msg: "Usuario creado exitosamente."
        })
    });
});


app.put('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {

    //El id se recibe como parámetro de la url
    let id = req.params.id;
    //Evitar que el campo password y google puedan ser actualizados desde lugar diferente a la aplicación
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    //Buscar el usuario por id para actualizarlo validando lo que está en el modelo y devuelve el nuevo objeto
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo actualizar el usuario"
            });
        }

        if (!usuarioDB) {
            return res.status(404).send({ ok: false, msg: `No se pudo actualizar el usuario` });
        }

        return res.send({
            ok: true,
            msg: "Usuario actualizado.",
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {


    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    //Busca el usuario por id y actualiza su estado a false para hacer una eliminación lógica
    Usuario.findOneAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo eliminar el usuario"
            });
        }
        //Si no consigue ningún usuario con ese id
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario no encontrado en la Base de Datos."
            });
        }

        res.status(200).json({
            ok: true,
            msg: `Usuario ha sido eliminado`,
            usuario: usuarioBorrado
        });
    });

});

module.exports = app;