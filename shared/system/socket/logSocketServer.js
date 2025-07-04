// shared/system/socket/logSocketServer.js

require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');
const { checkApiKey } = require('../../../middleware/auth');
const { isOnCooldown } = require('../../../middleware/cooldown');

const PORT = process.env.SOCKET_PORT || 3001;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Un client connecté à logSocket');

  socket.on('logEventConfigTopaze', (data) => {
    const expectedKey = `${process.env.AK_COR}-${process.env.AK_GLB}-${process.env.AK_LOG}`;

    if (!checkApiKey(data, expectedKey)) {
      console.warn('[LogSocketServer] ❌ Clé API invalide pour Topaze.');
      return;
    }

    if (isOnCooldown(socket.id, 1500)) {
    console.warn('[LogSocketServer] ⏳ Cooldown actif pour Topaze.');
    return;
    }

    const { apiKey, ...payload } = data;
    console.log('[LogSocketServer] ✅ Log autorisé Topaze :', payload);
    io.emit('newLogConfigTopaze', payload);
  });

  socket.on('logEventCalcQuartz', (data) => {
    const expectedKey = `${process.env.AK_STT}-${process.env.AK_GLB}-${process.env.AK_LOG}`;

    if (!checkApiKey(data, expectedKey)) {
      console.warn('[LogSocketServer] ❌ Clé API invalide pour Quartz.');
      return;
    }

    const { apiKey, ...payload } = data;
    console.log('[LogSocketServer] ✅ Log autorisé Quartz :', payload);
    io.emit('newLogCalcQuartz', payload);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur de logs lancé sur le port ${PORT}`);
});