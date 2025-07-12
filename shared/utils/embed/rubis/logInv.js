// shared/utils/embed/rubis/logInv.js

const { EmbedBuilder } = require('discord.js');

module.exports.buildInviteEmbed = (member, invitedBy) => {
  return new EmbedBuilder()
    .setTitle('➕ Nouveau membre rejoint via une invitation')
    .setDescription(`Un membre a rejoint grâce à une invitation.`)
    .addFields(
      { name: 'Membre', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
      { name: 'Compte créé', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
      { name: 'Invité par', value: invitedBy ? `<@${invitedBy}>` : 'Inconnu', inline: true },
      { name: 'Guild', value: `${member.guild.name}`, inline: false }
    )
    .setColor(0x00cc00) // Vert Add
    .setTimestamp();
};