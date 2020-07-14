const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function(req, res) {

    // Con esto, cuando la persona digite url/usuario?desde=10
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // Entre las llaves se pone la condición. Sería como el where
    // El segundo parámetro es un string con los campos separados por espacios, que quiero mostrar
    Usuario.find({ estado: true }, 'nombre email estado google role img')
        .skip(desde) // para paginar es útil esta función.
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // la condición acá y en el find debe ser la misma para que no haya incoherencias.
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });
        });

});

app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);



    // Con new aseguramos que el objeto devuelto es el actualizado, no el original
    // Con runValidators garantizamos que se aplican las validaciones del Schema, de lo contrario se las salta
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let logica = req.query.logica || 1;
    logica = Number(logica);
    let eliminacionLogica = true;
    if (logica === 0) {
        eliminacionLogica = false;
    }

    console.log(logica);

    if (eliminacionLogica) {

        // Eliminación lógica
        Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                usuario: usuarioDB
            });
        });
    } else {
        // Eliminación física
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
    }
});

module.exports = app;