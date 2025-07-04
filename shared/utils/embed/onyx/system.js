const { EmbedBuilder } = require('discord.js');

function createStartEmbed(user, botName) {
  return new EmbedBuilder()
    .setTitle('🟢 Demande de démarrage')
    .setDescription(`Souhaitez-vous lancer le bot distant **${botName}** ?`)
    .setColor(0x2ecc71)
    .setTimestamp()
    .setFooter({ text: `Demande par ${user.tag}`, iconURL: user.displayAvatarURL() });
}

function createShutdownEmbed(user, botName) {
  return new EmbedBuilder()
    .setTitle('🔴 Demande d’arrêt')
    .setDescription(`Souhaitez-vous arrêter le bot distant **${botName}** ?`)
    .setColor(0xe74c3c)
    .setTimestamp()
    .setFooter({ text: `Demande par ${user.tag}`, iconURL: user.displayAvatarURL() });
}

module.exports = {
  createStartEmbed,
  createShutdownEmbed
};