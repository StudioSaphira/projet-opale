// shared/socket/logSocketServer.js

require('dotenv').config(); // ← N'oublie pas si tu utilises process.env
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Un client connecté à logSocket');

  socket.on('logEventTopaze', (data) => {
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
    io.emit('newLog', payload); // Transmission aux clients (ex : Rubis)
  });
});

server.listen(3001, () => {
  console.log('🚀 Serveur de logs lancé sur le port 3001');
});