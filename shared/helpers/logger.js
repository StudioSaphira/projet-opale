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
    socket.emit('logEventConfigTopaze', payload);
  } catch (err) {
    console.error('[sendLogConfigToRubis] Erreur lors de la transmission du log à Rubis depuis Topaze :', err);
  }
}

/**
 * Envoie un log de calcul/statistiques à Rubis depuis Quartz.
 * @param {Guild} guild - Objet Guild Discord
 * @param {User} user - Utilisateur ayant effectué le calcul
 * @param {string} message - Description du calcul effectué
 * @param {Client} client - Client Discord (Quartz)
 * @param {string} [title] - Titre du log (ex : 'Nouveau calcul effectué')
 * @param {string} [icon] - Emoji facultatif (par défaut : '🔢')
 */
async function sendLogCalcToRubis(guild, user, message, client = null, title = 'Calcul effectué', icon = '⬜') {
  try {
    if (!client) {
      return console.warn('[sendLogCalcToRubis] Aucun client Discord fourni.');
    }

    const payload = {
      apiKey: `${process.env.API_KEY_STT}-${process.env.API_KEY_GLB}-${process.env.API_KEY_LOG}`,
      guildId: guild.id,
      title,
      message: `${message}\n**Par :** ${user.tag}`,
      icon,
      fromClientId: client.user.id,
      botAvatar: client.user.displayAvatarURL(),
      botName: client.user.username
    };
    console.log('[Quartz] Émission vers Rubis :', payload);
    socket.emit('logEventCalcQuartz', payload);
  } catch (err) {
    console.error('[sendLogCalcToRubis] Erreur lors de la transmission du log à Rubis depuis Quartz :', err);
  }
}

module.exports = { 
  sendLogRemoveMemberToRubis, // [ 🟦SAPHIR ]-->[🟥RUBIS]
  sendLogInfractionToRubis,  // [💎DIAMANT ]--->[🟥RUBIS]
  sendLogAddMemberToRubis,  // [ 🟦SAPHIR ]---->[🟥RUBIS]
  sendLogSanctionToRubis,  // [💎DIAMANT ]----->[🟥RUBIS]
  sendLogTicketToRubis,   // [🟩ÉMERAUDE]------>[🟥RUBIS]
  sendLogConfigToRubis,  // [ 🟨TOPAZE ]------->[🟥RUBIS]
  sendLogClearToRubis,  // [💎DIAMANT ]-------->[🟥RUBIS]
  sendLogWarnToRubis,  // [💎DIAMANT ]--------->[🟥RUBIS]
  sendLogCalcToRubis  // [ ⬜QUARTZ ]---------->[🟥RUBIS]
 };