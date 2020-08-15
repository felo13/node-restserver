const express = require('express');
const { ObjectId } = require('mongodb');
const _ = require('underscore');

let Producto = require('../models/producto');
const assert = require('assert');

let { verificarToken } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');

const app = express();


// ============================
// Mostrar todos las productos
// ============================
app.get('/producto', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre precioUni descripcion categoria usuario')
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Producto.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    producto,
                    total: conteo
                });
            });
        });
});

// ============================
// Mostrar un producto por Id
// ============================
app.get('/producto/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto,
            });
        });
});

// ============================
// Buscar productos
// ============================
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;
    // La 'i' indica que es insensible a mayus-minus
    let regex = new RegExp(termino, 'i');
    Producto.find({
            $or: [{ nombre: regex }, { descripcion: regex }]
        })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto,
            });
        });
});


// app.post('/producto', verificarToken, (req, res) => {

//     let body = req.body;

//     let producto = new Producto({
//         nombre: body.nombre,
//         precioUni: body.preciouni,
//         descripcion: body.descripcion,
//         usuario: req.usuario._id,
//         disponible: true,
//         categoria: ObjectId(body.categoria)
//     });

//     console.log(producto);

//     producto.save((err, productoDB) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 err
//             });
//         }
//         res.json({
//             ok: true,
//             producto: productoDB
//         });
//     });

// });

// ============================
// Crear nuevo producto categoría fácil
// ============================
app.post('/producto', verificarToken, (req, res) => {

    let body = req.body;

    Categoria.findOne({ descripcion: body.categoria })
        .exec((err, categoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error general buscando por descripcion'
                    }
                });
            }
            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoría no encontrada'
                    }
                });
            }
            let producto = new Producto({
                nombre: body.nombre,
                precioUni: body.preciouni,
                descripcion: body.descripcion,
                usuario: req.usuario._id,
                disponible: true,
                categoria: categoria.id
            });

            console.log(producto);

            producto.save((err, productoDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    producto: productoDB
                });
            });
        });


});

// ============================
// Actualizar una categoría
// ============================
app.put('/producto/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion', 'precioUni', 'categoria']);

    console.log(body);
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });


});

// ============================
// Borrar una categoría
// ============================
app.delete('/producto/:id', verificarToken, (req, res) => {


    let id = req.params.id;
    let logica = req.query.logica || 1;
    logica = Number(logica);
    let eliminacionLogica = true;
    if (logica === 0) {
        eliminacionLogica = false;
    }

    if (eliminacionLogica) {

        // Eliminación lógica
        Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'producto no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
    } else {
        // Eliminación física
        Producto.findByIdAndRemove(id, (err, productoBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado
            });
        });
    }
});


module.exports = app;