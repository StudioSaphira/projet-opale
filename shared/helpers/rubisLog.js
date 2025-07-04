// shared/helpers/rubisLog.js

require('dotenv').config();
const { io } = require('socket.io-client');

const RUBIS_HOST = process.env.SOCKET_ADRESS || 'localhost';
const RUBIS_PORT = parseInt(process.env.SOCKET_PORT, 10) || 3001;

const SOCKET_URL = `http://${RUBIS_HOST}:${RUBIS_PORT}`;

// Connexion persistante
const socket = io(SOCKET_URL, {
  reconnection: true
});

/**
 * Envoie un log de configuration depuis Topaze vers Rubis.
 * @param {string} botName - Nom du bot émetteur.
 * @param {string} message - Message du log.
 */
function sendLogConfigToRubis(botName, message) {
  const apiKey = `${process.env.API_KEY_COR}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`;

  const payload = {
    apiKey,
    bot: botName,
    type: 'CONFIG',
    message,
    timestamp: new Date().toISOString()
  };

  socket.emit('logEventConfigTopaze', payload);
}

/**
 * Envoie un log de calcul/statistique depuis Quartz vers Rubis.
 * @param {string} botName - Nom du bot émetteur.
 * @param {string} message - Message du log.
 */
function sendLogCalcToRubis(botName, message) {
  const apiKey = `${process.env.API_KEY_STT}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`;

  const payload = {
    apiKey,
    bot: botName,
    type: 'CALC',
    message,
    timestamp: new Date().toISOString()
  };

  socket.emit('logEventCalcQuartz', payload);
}

module.exports = {
  sendLogConfigToRubis,
  sendLogCalcToRubis
};
