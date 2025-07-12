// bot/onyx/commands/system/status.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const botList = [
  { name: 'Opale', id: process.env.ID_SYS },
  { name: 'Onyx', id: process.env.ID_SSB },
  { name: 'Topaze', id: process.env.ID_COR },
  { name: 'Péridot', id: process.env.ID_ATM },
  { name: 'Lazulite', id: process.env.ID_WIK },
  { name: 'Rubis', id: process.env.ID_LOG },
  { name: 'Célestine', id: process.env.ID_IAH },
  { name: 'Saphir', id: process.env.ID_CSG },
  { name: 'Quartz', id: process.env.ID_STT },
  { name: 'Turquoise', id: process.env.ID_FRP },
  { name: 'Diamant', id: process.env.ID_MDG },
  { name: 'Jais', id: process.env.ID_ARD },
  { name: 'Némésite', id: process.env.ID_MDH },
  { name: 'Obsidienne', id: process.env.ID_SVG },
  { name: 'Émeraude', id: process.env.ID_TIC },
  { name: 'Améthyste', id: process.env.ID_ROLE },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Affiche le statut en ligne des bots du projet Opale.'),

  ownerOnly: true,

  async execute(interaction, client) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    const statuses = await Promise.all(
      botList.map(async bot => {
        try {
          const user = await client.users.fetch(bot.id);
          return {
            name: bot.name,
            online: user?.presence?.status === 'online' || user?.bot
          };
        } catch {
          return {
            name: bot.name,
            online: false
          };
        }
      })
    );

    const embed = new EmbedBuilder()
      .setTitle('📡 Statut des bots Opale')
      .setColor(0x00AEFF)
      .setTimestamp();

    statuses.forEach(status => {
      embed.addFields({
        name: status.name,
        value: status.online ? '🟢 En ligne' : '🔴 Hors ligne',
        inline: true
      });
    });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};