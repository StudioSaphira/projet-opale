const { EmbedBuilder } = require('discord.js');

function createResetEmbed(columnName, user) {
  return new EmbedBuilder()
    .setTitle('Confirmation de réinitialisation')
    .setDescription(`Souhaitez-vous vraiment réinitialiser le champ \`${columnName}\` ? Cette action est **irréversible**.`)
    .setColor(0xf1c40f)
    .setTimestamp()
    .setFooter({ text: `Demande par ${user.tag}`, iconURL: user.displayAvatarURL() });
}

function createResetAllEmbed(columnName, user) {
  return new EmbedBuilder()
    .setTitle('Confirmation de réinitialisation totale')
    .setDescription(`Souhaitez-vous vraiment réinitialiser les champs de la table server_config ? Cette action est **irréversible**.`)
    .setColor(0xf1c40f)
    .setTimestamp()
    .setFooter({ text: `Demande par ${user.tag}`, iconURL: user.displayAvatarURL() });
}

module.exports = {
  createResetEmbed,
  createResetAllEmbed
};