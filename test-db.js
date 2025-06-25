const db = require('./shared/database/utils/db');

const guildId = '1071107000202698752';
const row = db.prepare('SELECT * FROM server_config WHERE guild_id = ?').get(guildId);

console.log('Données actuelles dans la base pour le serveur :', row);