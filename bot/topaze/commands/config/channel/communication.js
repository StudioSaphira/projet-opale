// bot/topaze/commands/config/channel/communication.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-communication')
    .setDescription('Définit le salon utilisé pour les annonces automatisées (YouTube, Twitch, etc.)')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Salon cible pour les annonces')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const newChannel = interaction.options.getChannel('salon');

    try {
      const row = db.prepare(`
        SELECT channel_id FROM channel_communication WHERE guild_id = ?
      `).get(guildId);

      if (row) {
        db.prepare(`
          UPDATE channel_communication
          SET channel_id = ?, old_channel_id = ?
          WHERE guild_id = ?
        `).run(newChannel.id, row.channel_id, guildId);
      } else {
        db.prepare(`
          INSERT INTO channel_communication (guild_id, channel_id)
          VALUES (?, ?)
        `).run(guildId, newChannel.id);
      }

      await interaction.reply({
        content: `✅ Le salon de communication a été défini sur <#${newChannel.id}>.`,
        flags: 64
      });

    } catch (err) {
      console.error('Erreur /config-communication :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};