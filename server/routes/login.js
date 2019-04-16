//Rutas para trabajar.
const express = require('express');
//libreria para encriptar
const bcrypt = require('bcrypt');
//libreria para crear tokens
const jwt = require('jsonwebtoken');
//Libreria underscore agrega funcionalidades para trabajar con Objetos
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar el usuario"
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                msg: "Nombre de usuario incorrecto"
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                msg: "Password incorrecto"
            });
        }
        //creando el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    });

})


module.exports = app;