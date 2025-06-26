// bot/topaze/commands/config/channel/config-log.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-log')
    .setDescription('Configurer le salon de logs')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon où seront envoyés les logs')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.user;
    const member = interaction.member;
    const guild = interaction.guild;
    const guildId = guild.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const row = db.prepare('SELECT role_admin_id, channel_log_id FROM server_config WHERE guild_id = ?').get(guildId);
    const adminRoleIds = row?.role_admin_id?.split(',').filter(id => id.trim() !== '') || [];
    const hasAdminRole = adminRoleIds.some(id => member.roles.cache.has(id));
    const isOwner = ownerIds.includes(user.id);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const channel = interaction.options.getChannel('salon');

    try {
      if (previousChannelId && previousChannelId !== channel.id) {
        db.prepare(`
          INSERT INTO old_server_config (guild_id, old_channel_log_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_channel_log_id = excluded.old_channel_log_id
        `).run(guildId, previousChannelId);
      }

      db.prepare(`
        INSERT INTO server_config (guild_id, channel_log_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_log_id = excluded.channel_log_id
      `).run(guildId, channel.id);

      const embed = createConfigEmbed('channel_log_id', channel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = previousChannelId
        ? `Le salon de logs a été mis à jour : <#${channel.id}> (\`${channel.id}\`) → <#${previousChannelId}> (\`${previousChannelId}\`)`
        : `Le salon de logs a été défini : <#${channel.id}> (\`${channel.id}\`)`;

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Log',
        '📘'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-log :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};