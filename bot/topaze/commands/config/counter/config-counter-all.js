const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');

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

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const config = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const hasAdminRole = config?.role_admin_id && interaction.member.roles.cache.has(config.role_admin_id);
    const isOwner = ownerIds.includes(userId);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation de modifier ce paramètre.',
        flags: 64
      });
    }

    db.prepare(`
      INSERT INTO server_config (guild_id, channel_counter_allmember_id)
      VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET channel_counter_allmember_id = excluded.channel_counter_allmember_id
    `).run(guildId, channel.id);

    return interaction.reply({
      content: `✅ Salon de compteur global mis à jour : ${channel}`,
      flags: 64
    });
  }
};