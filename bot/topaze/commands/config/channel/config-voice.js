const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-voice')
    .setDescription('Configurer le salon vocal de création automatique')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon vocal utilisé pour créer automatiquement des vocaux temporaires')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

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
        INSERT INTO server_config (guild_id, channel_voice_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_voice_id = excluded.channel_voice_id
      `).run(guildId, channel.id);

      return interaction.reply({
        content: `🎙️ Salon vocal configuré : <#${channel.id}> (\`${channel.name}\`)`,
        flags: 64
      });
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-voice :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};