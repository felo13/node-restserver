const express = require('express');
const _ = require('underscore');

let Categoria = require('../models/categoria');

let { verificarToken, VerificarAdminRole } = require('../middlewares/autenticacion');

const app = express();

// ============================
// Mostrar todas las categorías
// ============================
app.get('/categoria', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let desc = req.query.desc;

    if (!desc) {

        // Entre las llaves se pone la condición. Sería como el where
        // El segundo parámetro es un string con los campos separados por espacios, que quiero mostrar
        // El populate lo que hace es que reemplaza los campos tipo Schema.Type.ObjectId con los datos del cual él es llave primaria
        // El segundo argumento del populate, son los campos que quiero mostrar, además del id, dentro del objeto que construye, yendo a la respectiva tabla
        // Si tuviéramos otro schema a llenar (otra referencia foránea) se pone otro .populate aparte
        Categoria.find({ estado: true }, 'descripcion')
            .sort('descripcion')
            .skip(desde)
            .limit(limite)
            .populate('usuario', 'nombre email')
            .exec((err, categorias) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                Categoria.count({ estado: true }, (err, conteo) => {
                    res.json({
                        ok: true,
                        categorias,
                        total: conteo
                    });
                });
            });
    } else {
        console.log(desc);
        Categoria.findOne({ descripcion: desc })
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
                res.json({
                    ok: true,
                    categoria,
                });
            });
    }
});

// ============================
// Mostrar una categoría por Id
// ============================
app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, 'descripcion')
        .exec((err, categoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
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
            res.json({
                ok: true,
                categoria,
            });
        });
});

// ============================
// Crear nueva categoría
// ============================
app.post('/categoria', verificarToken, (req, res) => {
    // regresa la nueva categoría
    // req.categoria._id

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ============================
// Actualizar una categoría
// ============================
app.put('/categoria/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });


});

// ============================
// Borrar una categoría
// ============================
app.delete('/categoria/:id', [verificarToken, VerificarAdminRole], (req, res) => {
    // Solo el admin puede borrar categorías
    // Categoria.findByIdAndRemove

    let id = req.params.id;
    let logica = req.query.logica || 1;
    logica = Number(logica);
    let eliminacionLogica = true;
    if (logica === 0) {
        eliminacionLogica = false;
    }

    if (eliminacionLogica) {

        // Eliminación lógica
        Categoria.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoría no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
    } else {
        // Eliminación física
        Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaBorrada) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoría no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaBorrada
            });
        });
    }
});

module.exports = app;