require('dotenv').config();

const { startApi } = require('./server');
const { startWeb } = require('./web-server');

async function startAll() {
  try {
    const apiPort = process.env.API_PORT || 3000;
    const webPort = process.env.WEB_PORT || 8888;

    startApi(apiPort);
    startWeb(webPort);

    console.log('✅ Todos los servicios levantados correctamente');
  } catch (err) {
    console.error('❌ Error iniciando servicios:', err);
    process.exit(1);
  }
}

startAll();