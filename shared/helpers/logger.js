// shared/helpers/logger.js

require('dotenv').config();
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

/**
 * Envoie un log formaté à Rubis via un événement.
 * @param {Guild} guild - Objet Guild Discord
 * @param {User} user - Utilisateur à l’origine de l’action
 * @param {string} message - Contenu du message de log
 * @param {Client} client - Client Discord (Topaze)
 * @param {string} [title] - Titre facultatif du log
 * @param {string} [icon] - Emoji facultatif (ex: '🔧')
 */
async function sendLogConfigToRubis(guild, user, message, client = null, title = 'Modification de configuration', icon = '⚙️') {
  try {
    if (!client) {
      return console.warn('[sendLogToRubis] Aucun client Discord fourni.');
    }

    const payload = {
      apiKey: `${process.env.API_KEY_COR}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`,
      guildId: guild.id,
      title,
      message: `${message}\n**Par :** ${user.tag}`,
      icon,
      fromClientId: client.user.id,
      botAvatar: client.user.displayAvatarURL(),
      botName: client.user.username
    };
    console.log('[Topaze] Émission vers Rubis :', payload);
    socket.emit('logEventTopaze', payload);
  } catch (err) {
    console.error('[sendLogConfigToRubis] Erreur lors de la transmission du log à Rubis depuis Topaze :', err);
  }
}

module.exports = { 
  sendLogConfigToRubis,
  sendLogCalcToRubis
 };