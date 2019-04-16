//Rutas para trabajar.
const express = require('express');
//libreria para encriptar
const bcrypt = require('bcrypt');
//libreria para crear tokens
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

//Válidar el token
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async(req, res) => {

    //Recibiendo el token que envia el login de google
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //Buscar al usuario de google si existe en la BD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Ya hay un usuario creado 
        if (usuarioDB) {
            //El usuario se creó con su email normalmente
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Debe usar su autenticación normal."
                    }
                });
            } else {
                //Previamente autenticado con google
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            //El usuario se loguea por primera vez con su cuenta google
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = bcrypt.hashSync('=)', 10); //esto porque en el modelo el password es requerido

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            });
        }


    });


});

module.exports = app;