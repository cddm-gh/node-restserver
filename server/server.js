require('./config/config');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.PORT;

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//parse application/json
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/usuario', (req, res) => {

    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            msg: "El nombre es necesario."
        })
    } else {

        res.json({
            persona: body
        })
    }
})

app.put('/usuario/:id', (req, res) => {
    let id = req.params.id;

    res.json({
        id,
        msj: "Actualización"
    })
})

app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;

    res.json({
        id,
        msj: "Eliminación"

    })
})

app.listen(port, () => console.log(`App corriendo en el puerto: ${port} ...`))