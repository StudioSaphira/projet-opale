// bot/topaze/commands/config/counter/config-counter-all.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-counter-all')
    .setDescription('Définit le salon de compteur pour le total des membres')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Le salon à utiliser comme compteur de tous les membres')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('salon');
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const config = db.prepare('SELECT role_admin_id, channel_counter_allmember_id FROM server_config WHERE guild_id = ?').get(guildId);
    const adminRoles = config.role_admin_id?.split(',') || [];
    const hasAdminRole = adminRoles.some(id => interaction.member.roles.cache.has(id));
    const previousChannelId = config?.channel_counter_allmember_id;
    const isOwner = ownerIds.includes(userId);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation de modifier ce paramètre.',
        flags: 64
      });
    }

    try {
      if (previousChannelId && previousChannelId !== channel.id) {
        db.prepare(`
          INSERT INTO old_server_config (guild_id, old_channel_counter_allmember_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_channel_counter_allmember_id = excluded.old_channel_counter_allmember_id
        `).run(guildId, previousChannelId);
      }

      db.prepare(`
        INSERT INTO server_config (guild_id, channel_counter_allmember_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_counter_allmember_id = excluded.channel_counter_allmember_id
      `).run(guildId, channel.id);

      const embed = createConfigEmbed('channel_counter_allmember_id', channel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = previousChannelId
        ? `Le compteur de tous les membres a été mis à jour : <#${channel.id}> (\`${channel.id}\`) → <#${previousChannelId}> (\`${previousChannelId}\`)`
        : `Le compteur de tous les membres a été défini : <#${channel.id}> (\`${channel.id}\`)`;

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Compteurs',
        '👥'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-counter-all :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};