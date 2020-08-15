const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
// hace que todos los archivos caigan en req.files
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha sleccionado nungún archivo'
            }
        });
    }

    // Valida tipo
    // dbee hacer match con los directorios dentro de uploads
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
                tipo
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extensión debe ser: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${nombreArchivo}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        switch (tipo) {
            case tiposValidos[0]:
                imagenProducto(id, res, nombreArchivo);
                break;
            case tiposValidos[1]:
                imagenUsuario(id, res, nombreArchivo);
                break;

            default:
                break;
        }


        /* res.json({
            ok: true,
            message: 'Imagen subida correctamente'
        }); */
    });
});

const imagenUsuario = (id, res, nombreArchivo) => {

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuario) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado para asociar imagen'
                }
            });
        }

        borraArchivo(usuario.img, 'usuarios');

        usuario.img = nombreArchivo;
        usuario.save((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
                img: nombreArchivo
            });
        });
    });
};

const imagenProducto = (id, res, nombreArchivo) => {

    Producto.findById(id, (err, producto) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!producto) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado para asociar imagen'
                }
            });
        }

        borraArchivo(producto.img, 'productos');

        producto.img = nombreArchivo;
        producto.save((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
                img: nombreArchivo
            });
        });
    });
};

const borraArchivo = (nombreImagen, tipo) => {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;