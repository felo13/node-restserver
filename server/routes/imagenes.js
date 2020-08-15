const express = require('express');
const fs = require('fs');
const path = require('path');

let { verificarTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagenes/:tipo/:img', (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    let noImgPath = path.resolve(__dirname, '../assets/noimage.png');

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        res.sendFile(noImgPath);
    }


});

module.exports = app;