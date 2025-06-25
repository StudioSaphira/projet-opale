const db = require('./shared/database/utils/db');

const guildId = '1071107000202698752'; // Remplace si besoin

try {
  const stmt = db.prepare('DELETE FROM server_config WHERE guild_id = ?');
  stmt.run(guildId);
  console.log(`✅ Configuration supprimée pour le serveur ${guildId}`);
} catch (err) {
  console.error('❌ Erreur lors de la suppression :', err);
}