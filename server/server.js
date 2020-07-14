require('./config/config');
const mongoose = require('mongoose');
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

/**
 * Dir: https://cloud.mongodb.com/v2/5f0e02ec018584467b83f6f5#clusters
 * Usuario de la BD en la nube: mongoAdminNode
 * Password 698nsO2Nf0BXvcpC
 * URL: mongodb+srv://mongoAdminNode:698nsO2Nf0BXvcpC@cluster0.jykue.mongodb.net/cafe
 */

// Definimos variable personalizada MONGO_URI en heroku para que la gente no pueda ver la cadena de conexión de la BD

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'));

// Forma que había hecho antes de tener la URL por config (me tocó hacer otra porque las URL son diferentes)
const conectarBD = async(ruta, puerto, bD) => {
    await mongoose.connect(`mongodb:${ruta}:${puerto}/${bD}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
};

const conectarBD1 = async() => {
    await mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
};

// Código deprecado como lo hizo el profe
/* mongoose.connect('mongodb://localhost:27017/cafe', (err) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');

}); */

// Como se usaría la forma 0 para conectar
/* conectarBD('//localhost', 27017, 'cafe')
    .then(() => console.log('BD ONLINE'))
    .catch((err) => console.log(err));
 */

// Como se usaría la forma 1 para conectar
conectarBD1()
    .then(() => console.log('BD ONLINE'))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto', process.env.PORT);
});