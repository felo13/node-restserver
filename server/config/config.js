/*
 **   Arcvhivo para que no tengamos que preocuparnos por cambiar las variables cuando este mos en local o desplegados
 */


// ===========================
// Puerto
// ===========================
process.env.PORT = process.env.PORT || 3000;

// ===========================
// Entorno
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// Entorno
// ===========================
// Sin encriptarlo en una variable de entorno
/* if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://mongoAdminNode:698nsO2Nf0BXvcpC@cluster0.jykue.mongodb.net/cafe';
}
process.env.URLDB = urlDB; */

//Encriptando en una variable de entorno
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ===========================
// Vencimiento del Token
// ===========================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ===========================
// Semilla Autenticación
// ===========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'; // La variable se setea en Heroku directamente usando Heroku config: set SEED=""

// ===========================
// Google Client
// ===========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '745124012845-ci3qepc1a7ucl2jd319oa5f9cfsg8isu.apps.googleusercontent.com';