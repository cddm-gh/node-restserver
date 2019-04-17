const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//Obtener todos los productos
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 10;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde) //Desde que página mostrar
        .limit(limite) //Obtener de 5 en 5
        .sort('nombre')
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion') //Llenar los datos del esquema
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "No se pueden mostrar los productos.",
                    err
                });
            }

            //Debe tener el mismo parámetro de Usuario.find para que los cuente de la misma manera
            Producto.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        msg: "No se pueden contar los productos.",
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    cuantos_registros: conteo,
                    productos
                })
            });

        });

});

//Obtener un producto por su id
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: "No se encontró un producto con ese ID"
            });
        }

        res.status(200).json({
            ok: true,
            producto
        });
    });

});

//Buscar producto por termino
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "No existe un producto con esa descripción."
                    }
                })
            }

            res.json({
                ok: true,
                productos
            })
        });

});

//Crear un producto
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria, //id de la categoria a la que pertenece el producto
        usuario: req.usuario._id //El id del usuario que está conectado
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            producto: productoDB
        });
    });

});

//Actualizar un producto
app.put('/producto/:id', verificaToken, (req, res) => {

    //El id se recibe como parámetro de la url
    let id = req.params.id;
    let body = req.body;
    //Campos para actualizar
    let actProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        usuario: req.usuario._id,
        categoria: body.categoria
    }

    //Buscar el usuario por id para actualizarlo y devuelve el nuevo objeto
    Producto.findByIdAndUpdate(id, actProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo actualizar el producto"
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Producto actualizado.",
            producto: productoDB
        });
    });
});

//Eliminar del stock un producto
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo borrar el producto"
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Producto eliminado.",
            producto: productoDB
        });
    });
});

module.exports = app;