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

if (process.env.NODE_ENV === 'dev')
    urlDB = 'mongodb://localhost:27017/cafe'
else
    urlDB = `mongodb://${username}:${password}@ds139896.mlab.com:39896/cafe`;

process.env.URLDB = urlDB;