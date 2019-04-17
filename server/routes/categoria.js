const express = require('express');

let { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

const app = express();

let Categoria = require('../models/categoria');

//Mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    let desde = req.query.desde || 0; //Desde que página quiere ver los resultados, si no escoje por defecto 0
    desde = Number(desde);
    let limite = req.query.limite || 5; //Cuantos resultados quiere ver por página
    limite = Number(limite);


    Categoria.find({})
        .skip(desde) //Desde que página mostrar
        .limit(limite) //Obtener de 5 en 5
        .sort('descripcion')
        .populate('usuario', 'nombre email') //Llenar los datos del esquema
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "No se pueden mostrar las categorías.",
                    err
                })
            }
            //Debe tener el mismo parámetro de Usuario.find para que los cuente de la misma manera
            Categoria.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        msg: "No se pueden contar las categorías.",
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    cuantos_registros: conteo,
                    categorias
                })
            });

        });

});

//Mostrar una categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: "No se encontró una categoría con ese ID"
            })
        }

        res.status(200).json({
            ok: true,
            categoria
        })

    });

});

//Crear una nueva categoria
app.post('/categoria', [verificaToken, verificaAdminRol], function(req, res) {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id //El id del usuario que está conectado
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//Actualizar la categoria
app.put('/categoria/:id', [verificaToken, verificaAdminRol], function(req, res) {

    //El id se recibe como parámetro de la url
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    }

    //Buscar el usuario por id para actualizarlo y devuelve el nuevo objeto
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo actualizar la categoría"
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Categoría actualizada.",
            categoria: categoriaDB
        });
    });

});

//Eliminar fisicamente una categoria
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], function(req, res) {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo borrar la categoría"
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Categoría eliminada.",
            categoria: categoriaDB
        });
    });

});


module.exports = app;