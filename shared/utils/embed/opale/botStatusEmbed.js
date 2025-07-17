// shared/utils/embed/opale/botStatusEmbed.js

const { EmbedBuilder } = require('discord.js');

// Liste des bots avec leur nom visible et leur ID (à compléter dans ton .env)
const bots = [
  { name: 'Améthyste', id: process.env.ID_ROL },
  { name: 'Célestine', id: process.env.ID_IAH },
  { name: 'Diamant', id: process.env.ID_MDG },
  { name: 'Émeraude', id: process.env.ID_TIC },
  { name: 'Jais', id: process.env.ID_ARD },
  { name: 'Lazulite', id: process.env.ID_WIK },
  { name: 'Némésite', id: process.env.ID_MDH },
  { name: 'Obsidienne', id: process.env.ID_SVG },
  { name: 'Onyx', id: process.env.ID_SSB },
  { name: 'Opale', id: process.env.ID_SYS },
  { name: 'Péridot', id: process.env.ID_ATM },
  { name: 'Quartz', id: process.env.ID_STT },
  { name: 'Rubis', id: process.env.ID_LOG },
  { name: 'Saphir', id: process.env.ID_CSG },
  { name: 'Topaze', id: process.env.ID_COR },
  { name: 'Turquoise', id: process.env.ID_FRP }
];

module.exports = async function generateBotStatusEmbed(guild) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 État des Bots - Projet Opale')
    .setDescription(`Vérification de la présence des bots sur le serveur \`${guild.name}\``)
    .setColor(0x3498DB)
    .setTimestamp();

  for (const bot of bots) {
    const presence = guild.members.cache.has(bot.id);
    const status = presence ? '✅ Présent' : '❌ Absent';
    embed.addFields({
      name: bot.name,
      value: status,
      inline: true,
    });
  }

  return embed;
};