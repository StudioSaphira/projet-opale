// shared/utils/embed/embedRubisLog.js

const { EmbedBuilder } = require('discord.js');

/**
 * Crée un embed formaté pour un log de configuration envoyé à Rubis.
 * 
 * @param {Object} options
 * @param {string} options.title - Titre du log
 * @param {string} options.message - Message principal (incluant "Par : ...")
 * @param {string} [options.icon] - Emoji en en-tête (facultatif)
 * @returns {EmbedBuilder}
 */

function createLogConfigEmbed({ title, message, icon, botName = 'Topaze', botAvatar }) {
  return new EmbedBuilder()
    .setTitle(`${icon ? `${icon} ` : ''}${title}`)
    .setDescription(message)
    .setColor(0xf1c40f) // Couleur dorée pour la config
    .setTimestamp()
    .setFooter({
      text: `Log généré par ${botName}`,
      iconURL: botAvatar || undefined
      });
}

module.exports = {
  createLogConfigEmbed
};