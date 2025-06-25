const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-leaving')
    .setDescription('Configurer le salon pour les messages de départ')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon texte utilisé lors du départ de membres')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const isOwner = ownerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const roleAdminId = row?.role_admin_id;
    const isAdminRole = roleAdminId && interaction.member.roles.cache.has(roleAdminId);

    if (!isOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const channel = interaction.options.getChannel('salon');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, channel_leaving_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_leaving_id = excluded.channel_leaving_id
      `).run(guildId, channel.id);

      const embed = createConfigEmbed('channel_leaving_id', channel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le salon de départ a été mis à jour : <#${channel.id}> (\`${channel.id}\`)`,
        interaction.client,
        'Configuration : Flux',
        '👋'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-leaving :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};