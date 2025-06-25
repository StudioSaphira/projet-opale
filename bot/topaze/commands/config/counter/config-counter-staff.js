const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-counter-staff')
    .setDescription('Définit le salon de compteur du personnel')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Le salon à utiliser comme compteur du staff')
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

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, channel_counter_staff_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_counter_staff_id = excluded.channel_counter_staff_id
      `).run(guildId, channel.id);

      const embed = createConfigEmbed('channel_counter_staff_id', channel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le compteur des membres du staff a été mis à jour : <#${channel.id}> (\`${channel.id}\`)`,
        interaction.client,
        'Configuration : Compteurs',
        '🧑‍💼'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-counter-staff :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};