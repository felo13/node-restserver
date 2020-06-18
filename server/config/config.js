/*
 **   Arcvhivo para que no tengamos que preocuparnos por cambiar las variables cuando este mos en local o desplegados
 */


// ===========================
// Puerto
// ===========================
process.env.PORT = process.env.PORT || 3000;