require('./config/config');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
//libreria para dar color en la linea de comandos
const colors = require('colors');
const path = require('path');
const port = process.env.PORT;

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//parse application/json
app.use(bodyParser.json())

//Importar todas las rutas creadas
app.use(require('./routes/index'));

//Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

//Conectarse a la Base de Datos tanto local como remota
//mongodb+srv://gorydev:<password>@cluster0-vv9yi.mongodb.net/test
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) {
        throw new Error(err);
    } else {
        console.log('Conectado a la base de datos.'.underline.green);
    }
});

app.listen(port, () => console.log(`Servidor corriendo en el puerto: ${port}`.underline.white));