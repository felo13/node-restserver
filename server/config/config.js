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

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://mongoAdminNode:698nsO2Nf0BXvcpC@cluster0.jykue.mongodb.net/cafe';
}
process.env.URLDB = urlDB;