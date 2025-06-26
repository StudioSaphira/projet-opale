// shared/socket/logSocketServer.js

require('dotenv').config(); // ← N'oublie pas si tu utilises process.env
const { Server } = require('socket.io');
const http = require('http');

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
    const { apiKey, ...payload } = data;

    const allowedKeys = [
      `${process.env.API_KEY_COR}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`,
      `${process.env.API_KEY_COR}-${process.env.API_KEY_LOG}`,
      `${process.env.API_KEY_LOG}-${process.env.API_KEY_GLB}-${process.env.API_KEY_COR}`,
      `${process.env.API_KEY_LOG}-${process.env.API_KEY_COR}`,
      process.env.API_KEY_COR,
      process.env.API_KEY_LOG,
      process.env.API_KEY_GLB
    ];

    if (!allowedKeys.includes(apiKey)) {
      console.warn('[LogSocketServer] ❌ Clé API invalide :', apiKey);
      return;
    }

    console.log('[LogSocketServer] ✅ Log autorisé :', payload);
    io.emit('newLogConfigTopaze', payload);
  });

  socket.on('logEventCalcQuartz', (data) => {
    const { apiKey, ...payload } = data;

    const allowedKeys = [
      `${process.env.API_KEY_STT}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`,
      `${process.env.API_KEY_STT}-${process.env.API_KEY_LOG}`,
      `${process.env.API_KEY_LOG}-${process.env.API_KEY_GLB}-${process.env.API_KEY_STT}`,
      `${process.env.API_KEY_LOG}-${process.env.API_KEY_STT}`,
      process.env.API_KEY_STT,
      process.env.API_KEY_LOG,
      process.env.API_KEY_GLB
    ];

    if (!allowedKeys.includes(apiKey)) {
      console.warn('[LogSocketServer] ❌ Clé API invalide :', apiKey);
      return;
    }

    console.log('[LogSocketServer] ✅ Log autorisé :', payload);
    io.emit('newLogCalcQuartz', payload);
  });
});

server.listen(PORT, () => {
  console.log('🚀 Serveur de logs lancé sur le port ${PORT}');
});