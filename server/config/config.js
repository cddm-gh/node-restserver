/*  Archivo de configuración de variables
 para desarrollo y producción de la aplicación */

//=========================================================||
//                Puerto del servidor                      ||
//Si corre en un host se genera la variable de entorno PORT||
//Si corre localmente usará el puerto por defecto 3000     ||
//=========================================================||
process.env.PORT = process.env.PORT || 3000;

//=========================================================||
// Entorno (Desarrollo, Producción)
//=========================================================||
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//=========================================================||
// Base de datos
//=========================================================||
let urlDB;
let username = 'gorydev';
let password = 'Darkgo13';
//Si la variable de entorno NODE_ENV es 'dev' está en desarrollo
//Se crea una variable de entorno MONGO_URI en heroku
if (process.env.NODE_ENV === 'dev')
    urlDB = 'mongodb://localhost:27017/cafe'
else
    urlDB = process.env.MONGO_URI;

process.env.URLDB = urlDB;

//==============================================
//SEED para el token variable de entorno en heroku
//==============================================
process.env.SEED = process.env.SEED || 'seed-dev';

//==============================================
//Duración del token  30 días
//==============================================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//==============================================
//ID Client Google Sign In
//==============================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '937256517480-15pk4vi8t9tcgb5m22gb71vpvhbhbg0n.apps.googleusercontent.com';