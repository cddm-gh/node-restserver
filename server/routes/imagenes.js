const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { verificaTokenUrl } = require('../middlewares/autenticacion');


app.get('/imagen/:tipo/:img', verificaTokenUrl, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);


    //Si tiene una imágen, mostrarla
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else { //Si no tiene, mostrar la default
        let noImgPath = path.resolve(__dirname, '../assets/no-image-found.png');
        res.sendFile(noImgPath);
    }
});

module.exports = app;