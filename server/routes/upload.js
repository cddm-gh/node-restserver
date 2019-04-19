const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use(fileUpload());

app.put('/upload/:tipo/:id', verificaToken, (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No files were uploaded.'
        });
    }

    //Válidar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            msg: "El tipo no es válido debe ser (productos o usuario)"
        })
    }


    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo; //archivo es el nombre del input en el html
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[1];
    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            msg: "Extensión del archivo no válida"
        })
    }


    //Cambiar nombre del archivo para hacerlo único
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });


        if (tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo);
        if (tipo === 'productos')
            imagenProducto(id, res, nombreArchivo);
    });

});


function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, tipo);

            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, tipo);

            return res.status(400).json({
                ok: true,
                msg: "Usuario no existe"
            });
        }
        let tipo = 'usuarios';

        borraArchivo(usuarioDB.img, tipo);

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    });
}

function imagenProducto(id, res, nombreArchivo) {


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, tipo);

            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, tipo);

            return res.status(400).json({
                ok: true,
                msg: "Producto no existe"
            });
        }
        let tipo = 'productos';

        borraArchivo(productoDB.img, tipo);

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                archivo: nombreArchivo
            })
        })
    });
}

function borraArchivo(nombreArchivo, tipo) {

    //Para eliminar archivos anteriores
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;