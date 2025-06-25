// bot/rubis/logSocketClient.js

const io = require('socket.io-client');
const socket = io('http://localhost:3001');

function setupLogListener(client) {
  socket.on('connect', () => {
    console.log('🔵 Rubis connecté au serveur de logs');
  });

  socket.on('newLog', (payload) => {
    console.log('[Rubis] Reçu un log via socket.io');
    client.emit('logEventTopaze', payload); // ← Envoie à l’event local
  });
}

module.exports = { setupLogListener };
