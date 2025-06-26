// bot/rubis/logSocketClient.js

const io = require('socket.io-client');
const socket = io(`http://${process.env.IP_ADRESS}:${process.env.SOCKET_PORT}`);

function setupLogListener(client) {
  socket.on('connect', () => {
    console.log('🔵 Rubis connecté au serveur de logs');
  });

  socket.on('newLogConfigTopaze', (payload) => {
    console.log('[Rubis] Reçu un log via socket.io');
    client.emit('logEventTopaze', payload); // ← Envoie à l’event local
  });

  socket.on('newLogCalcQuartz', (payload) => {
    console.log('[Rubis] Reçu un log via socket.io');
    client.emit('logEventQuartz', payload); // ← Envoie à l’event local
  });
}

module.exports = { setupLogListener };
